#!/bin/bash
# update-turn.sh — Helper: incrementa turn counter
# Uso: bash hooks/update-turn.sh

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

# Se state.json não existe, retornar erro
[ ! -f "$STATE_FILE" ] && exit 1

# Incrementar atomicamente com jq + mktemp
TMP=$(mktemp)
$JQ '.turns.current += 1' "$STATE_FILE" > "$TMP" && mv "$TMP" "$STATE_FILE"
