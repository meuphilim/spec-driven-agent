#!/bin/bash
# save-session.sh — Salva estado atual em .sessions/
# Chamado por post-task e stop
# Uso: bash hooks/save-session.sh

# Encontrar jq
if command -v jq &> /dev/null; then
  JQ="jq"
elif [ -f "$HOME/AppData/Local/Microsoft/WinGet/Links/jq" ]; then
  JQ="$HOME/AppData/Local/Microsoft/WinGet/Links/jq"
elif [ -f "$HOME/AppData/Local/Microsoft/WinGet/Links/jq.exe" ]; then
  JQ="$HOME/AppData/Local/Microsoft/WinGet/Links/jq.exe"
elif [ -f "/usr/bin/jq" ]; then
  JQ="/usr/bin/jq"
elif [ -f "/usr/local/bin/jq" ]; then
  JQ="/usr/local/bin/jq"
else
  exit 0
fi

STATE_FILE="$(dirname "$0")/state.json"
SESSIONS_DIR="$(dirname "$0")/../.sessions"

# Se state.json não existe, ignorar
[ ! -f "$STATE_FILE" ] && exit 0

# Ler valores com jq
SESSION_ID=$($JQ -r '.session_id' "$STATE_FILE")
PHASE=$($JQ -r '.phase' "$STATE_FILE")
CURRENT=$($JQ -r '.turns.current' "$STATE_FILE")

# Criar diretório se não existir
mkdir -p "$SESSIONS_DIR"

OUTPUT="$SESSIONS_DIR/$SESSION_ID.md"

# Criar header apenas se arquivo não existe
if [ ! -f "$OUTPUT" ]; then
  echo "# Sessão: $SESSION_ID" > "$OUTPUT"
  echo "" >> "$OUTPUT"
fi

# Adicionar estado
cat >> "$OUTPUT" <<EOF

---

## Estado ao Interromper ($(date -u +%H:%M:%S))
- Fase: $PHASE
- Turns: $CURRENT
EOF

echo "✅ Estado salvo em: $OUTPUT"
