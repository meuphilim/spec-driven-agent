#!/bin/bash
# stop.sh — Hook: quando agente termina resposta
# Chamado pelo Claude Code: Stop
# Uso: bash hooks/stop.sh

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

# Se state.json não existe, ignorar
[ ! -f "$STATE_FILE" ] && exit 0

# Ler valores com jq
PHASE=$($JQ -r '.phase' "$STATE_FILE")
INTENTIONAL=$($JQ -r '.intentional_stop' "$STATE_FILE")
CURRENT=$($JQ -r '.turns.current' "$STATE_FILE")

# Só alertar se interrupção NÃO intencional
if [ "$INTENTIONAL" = "false" ] && [ "$PHASE" != "done" ]; then
  echo "⚠️ SESSÃO INTERROMPIDA — Fase: $PHASE (turn $CURRENT)"
  echo "📋 Execute /reflect antes de encerrar"
fi

# Salvar sessão
bash "$(dirname "$0")/save-session.sh"

exit 0
