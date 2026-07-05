#!/bin/bash
# events-compact.sh — Rotação e compactação de eventos JSONL
#
# Mantém eventos brutos por 90 dias. Após esse período:
#   - Lê todas as linhas do mês
#   - Agrega em snapshot mensal (monthly-YYYY-MM.snapshot.json)
#   - Remove o JSONL bruto
#
# Execução: 1x/dia (controlado por touch file em .last-compact)
# Uso: bash hooks/events-compact.sh

set -euo pipefail

source "$(dirname "$0")/_utils.sh"

HOOKS_DIR="$(cd "$(dirname "$0")" && pwd)"
METRICS_DIR="$HOOKS_DIR/../metrics"
COMPACT_MARKER="$METRICS_DIR/.last-compact"
RETENTION_DAYS=${SDA_EVENTS_RETENTION_DAYS:-90}

# ─── Verificar se já rodou hoje ──────────────────────────────────────────────
TODAY=$(date -u +%Y-%m-%d)
if [ -f "$COMPACT_MARKER" ]; then
  LAST_RUN=$(cat "$COMPACT_MARKER")
  if [ "$LAST_RUN" = "$TODAY" ]; then
    exit 0  # Já rodou hoje
  fi
fi

# ─── Garantir que o diretório existe ─────────────────────────────────────────
[ ! -d "$METRICS_DIR" ] && exit 0

# ─── Calcular cutoff date ────────────────────────────────────────────────────
# No bash puro, calcular data de 90 dias atrás é complexo (especialmente no Mac).
# Usamos node que funciona cross-platform.
CUTOFF=$(node -e "
  const d = new Date();
  d.setDate(d.getDate() - $RETENTION_DAYS);
  console.log(d.toISOString().slice(0, 10));
")

echo "🔍 Compaction: compactando eventos anteriores a $CUTOFF"

# ─── Para cada arquivo JSONL com data no nome ────────────────────────────────
# Formato: events-YYYY-MM-DD.jsonl
for f in "$METRICS_DIR"/events-*.jsonl; do
  [ -f "$f" ] || continue

  # Extrair data do nome do arquivo
  BASENAME=$(basename "$f")
  FILE_DATE="${BASENAME#events-}"
  FILE_DATE="${FILE_DATE%.jsonl}"

  # Verificar se é data válida
  if [[ ! "$FILE_DATE" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
    continue
  fi

  # Comparar datas (string comparison works for ISO dates)
  if [[ "$FILE_DATE" < "$CUTOFF" ]]; then
    # Extrair mês para o snapshot mensal
    MONTH_KEY="${FILE_DATE:0:7}"  # YYYY-MM
    SNAPSHOT_FILE="$METRICS_DIR/monthly-${MONTH_KEY}.snapshot.json"

    echo "  Compactando: $BASENAME → monthly-${MONTH_KEY}.snapshot.json"

    # Agregar eventos do mês usando node (append ao snapshot existente ou criar novo)
    node -e "
      const fs = require('fs');

      // Ler eventos do arquivo atual
      const content = fs.readFileSync('$f', 'utf8').trim();
      if (!content) { process.exit(0); }

      const events = content.split('\n').map(l => { try { return JSON.parse(l); } catch(e) { return null; } }).filter(e => e);

      // Ler snapshot existente se houver
      let snap = { events: 0, tasks: 0, tokens: { total: 0 }, months: {} };
      const snapPath = '$SNAPSHOT_FILE';
      if (fs.existsSync(snapPath)) {
        try { snap = JSON.parse(fs.readFileSync(snapPath, 'utf8')); } catch(e) {}
      }

      // Agregar
      snap.events += events.length;
      for (const e of events) {
        if (e.event === 'task') snap.tasks++;
        if (e.event === 'agent' && e.tokens && e.tokens.total) {
          snap.tokens.total += e.tokens.total;
        }
      }

      fs.writeFileSync(snapPath, JSON.stringify(snap, null, 2));

      // Remover arquivo bruto
      fs.unlinkSync('$f');
      console.log('    → Removido: $(basename "$f")');
    "
  fi
done

# ─── Registrar execução ──────────────────────────────────────────────────────
echo "$TODAY" > "$COMPACT_MARKER"

echo "✅ Compaction concluído"
exit 0
