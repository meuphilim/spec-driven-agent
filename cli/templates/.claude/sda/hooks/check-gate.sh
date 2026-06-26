#!/bin/bash
# check-gate.sh — Helper: valida estado de um GATE
# Uso: bash hooks/check-gate.sh [spec|plan|reflect]

source "$(dirname "$0")/_utils.sh"

STATE_FILE="$(dirname "$0")/state.json"
GATE_NAME="${1:-spec}"

# Se state.json não existe, retornar erro
[ ! -f "$STATE_FILE" ] && exit 1

# Ler e retornar status
STATUS=$($JQ -r ".gates.$GATE_NAME" "$STATE_FILE")
echo "$STATUS"
