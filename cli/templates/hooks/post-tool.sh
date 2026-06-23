#!/bin/bash
# post-tool.sh — Hook: após QUALQUER tool call
# Chamado pelo Claude Code: PostToolUse
# Uso: bash hooks/post-tool.sh [TOOL_NAME] [RESULT]

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
TOOL_NAME="${1:-unknown}"
TOOL_RESULT="${2:-ok}"

# Se state.json não existe, ignorar
[ ! -f "$STATE_FILE" ] && exit 0

# Registrar no history
TIMESTAMP=$(date -u +"%H:%M:%S")
echo "$TIMESTAMP:$TOOL_NAME:$TOOL_RESULT" >> "$(dirname "$0")/state.history.log"

# Alertar se tool falhou
if [ "$TOOL_RESULT" != "ok" ]; then
  echo "🚨 TOOL FALHOU: $TOOL_NAME — $TOOL_RESULT"
fi

exit 0
