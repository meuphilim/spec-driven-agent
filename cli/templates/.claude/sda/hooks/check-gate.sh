#!/bin/bash
# check-gate.sh — Helper: valida estado de um GATE
# Escreve evento gate no JSONL se aprovado.
# Uso: bash hooks/check-gate.sh [spec|plan|reflect] [SPEC_NAME]

source "$(dirname "$0")/_utils.sh"

STATE_FILE="$(dirname "$0")/state.json"
GATE_NAME="${1:-spec}"
SPEC_NAME="${2:-unknown}"

# Se state.json não existe, retornar erro
[ ! -f "$STATE_FILE" ] && exit 1

# Ler e retornar status
STATUS=$($JQ -r ".gates.$GATE_NAME" "$STATE_FILE")
echo "$STATUS"

# Se aprovado, registrar evento
if [ "$STATUS" = "approved" ]; then
  event_logger "{\"event\":\"gate\",\"gate\":\"$GATE_NAME\",\"status\":\"approved\",\"spec\":\"$SPEC_NAME\"}"
fi
