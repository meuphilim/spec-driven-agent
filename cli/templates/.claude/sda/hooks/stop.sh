#!/bin/bash
# stop.sh — Hook: quando agente termina resposta
# Chamado pelo Claude Code: Stop
# Uso: bash hooks/stop.sh

source "$(dirname "$0")/_utils.sh"

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

# Escrever evento session_end no JSONL
SESSION_ID=$($JQ -r '.session_id // "unknown"' "$STATE_FILE")
event_logger "{\"event\":\"session_end\",\"session_id\":\"$SESSION_ID\",\"reason\":\"stop\"}"

# Salvar sessão
bash "$(dirname "$0")/save-session.sh"

exit 0
