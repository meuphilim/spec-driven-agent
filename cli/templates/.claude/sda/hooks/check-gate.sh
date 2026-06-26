#!/bin/bash
# check-gate.sh — Helper: valida estado de um GATE
# Uso: bash hooks/check-gate.sh [spec|plan|reflect]

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
  exit 1
fi

STATE_FILE="$(dirname "$0")/state.json"
GATE_NAME="${1:-spec}"

# Se state.json não existe, retornar erro
[ ! -f "$STATE_FILE" ] && exit 1

# Ler e retornar status
STATUS=$($JQ -r ".gates.$GATE_NAME" "$STATE_FILE")
echo "$STATUS"
