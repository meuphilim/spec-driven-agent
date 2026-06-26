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
