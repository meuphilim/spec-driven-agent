#!/bin/bash
# post-tool.sh — Hook: após QUALQUER tool call
# Chamado pelo Claude Code: PostToolUse
# Uso: bash hooks/post-tool.sh [TOOL_NAME] [RESULT]

source "$(dirname "$0")/_utils.sh"

STATE_FILE="$(dirname "$0")/state.json"
TOOL_NAME="${1:-unknown}"
TOOL_RESULT="${2:-ok}"

# Se state.json não existe, ignorar
[ ! -f "$STATE_FILE" ] && exit 0

# Registrar no history
LOG_FILE="$(dirname "$0")/state.history.log"
TIMESTAMP=$(date -u +"%H:%M:%S")
echo "$TIMESTAMP:$TOOL_NAME:$TOOL_RESULT" >> "$LOG_FILE"

# Rotação: manter só últimas 500 linhas
if [ -f "$LOG_FILE" ]; then
  LINE_COUNT=$(wc -l < "$LOG_FILE" 2>/dev/null || echo 0)
  if [ "$LINE_COUNT" -gt 500 ]; then
    tail -500 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
  fi
fi

# Alertar se tool falhou
if [ "$TOOL_RESULT" != "ok" ]; then
  echo "🚨 TOOL FALHOU: $TOOL_NAME — $TOOL_RESULT"
fi

exit 0
