#!/bin/bash
# _utils.sh — Funções utilitárias compartilhadas pelos hooks

# Encontrar jq
find_jq() {
  if command -v jq &>/dev/null; then echo "jq"; return; fi
  for p in \
    "$HOME/AppData/Local/Microsoft/WinGet/Links/jq" \
    "$HOME/AppData/Local/Microsoft/WinGet/Links/jq.exe" \
    "/usr/bin/jq" "/usr/local/bin/jq"; do
    [ -f "$p" ] && echo "$p" && return
  done
  echo ""
}

JQ=$(find_jq)
if [ -z "$JQ" ]; then
  echo "⚠️ jq não encontrado. Hooks não funcionarão."
  exit 0
fi

# mktemp_safe — Criar ficheiro temporário de forma cross-platform
# Usa mktemp se disponível; fallback para node -e
mktemp_safe() {
  if command -v mktemp &>/dev/null; then
    mktemp "$@"
  else
    node -e "
      const fs = require('fs'), path = require('path');
      const tmp = path.join(require('os').tmpdir(), 'sda-' + process.pid + '-' + Date.now() + '.tmp');
      fs.writeFileSync(tmp, '');
      console.log(tmp);
    "
  fi
}

# ─── Event Logger — JSONL append-only ──────────────────────────────────────

# stdin_read — Lê stdin inteiro, fallback para "{}"
# Use no início de hooks para capturar o payload JSON do Claude Code.
stdin_read() {
  local input
  input=$(cat /dev/stdin 2>/dev/null || echo "")
  [ -z "$input" ] && echo "{}" || echo "$input"
}

# jsonl_write — Appenda 1 linha JSONL no arquivo do dia
# Cria o diretório metrics/ se não existir.
# Uso: jsonl_write <event_json_string>
jsonl_write() {
  local hooks_dir
  hooks_dir="$(cd "$(dirname "$0")" && pwd)"
  local metrics_dir="$hooks_dir/../metrics"
  local today
  today=$(date -u +%Y-%m-%d)
  local file="$metrics_dir/events-$today.jsonl"
  mkdir -p "$metrics_dir"
  echo "$1" >> "$file"
}

# event_logger — Constrói e escreve evento padronizado no JSONL
# Adiciona timestamp automaticamente.
# Uso: event_logger '{"event":"tool","tool":"Read",...}'
event_logger() {
  local ts
  ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  local payload="$1"
  # Se payload já começa com {, insere ts no início
  # Se payload está vazio, não escreve nada
  if [ -n "$payload" ]; then
    jsonl_write "{\"ts\":\"$ts\",$payload}"
  fi
}
