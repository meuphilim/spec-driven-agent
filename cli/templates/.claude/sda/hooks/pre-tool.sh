#!/bin/bash
# pre-tool.sh — Hook: antes de QUALQUER tool call
# Chamado pelo Claude Code: PreToolUse
# Uso: bash hooks/pre-tool.sh [TOOL_NAME]
# Exit: 0 = ok, 2 = bloqueado

source "$(dirname "$0")/_utils.sh"

STATE_FILE="$(dirname "$0")/state.json"
HOOKS_DIR="$(cd "$(dirname "$0")" && pwd)"

# Ler stdin (payload JSON do Claude Code) com fallback args posicionais
STDIN_JSON=$(stdin_read)
TOOL_NAME=$(echo "$STDIN_JSON" | $JQ -r '.tool_name // "'${1:-unknown}'"')
EFFORT=$(echo "$STDIN_JSON" | $JQ -r '.effort.level // "unknown"')

# Se state.json não existe, ignorar (primeira tool da sessão)
[ ! -f "$STATE_FILE" ] && exit 0

# Ler valores com jq (NÃO sed)
PHASE=$($JQ -r '.phase' "$STATE_FILE")
GATESPEC=$($JQ -r '.gates.spec' "$STATE_FILE")
GATEDESIGN=$($JQ -r '.gates.design' "$STATE_FILE")
GATEPLAN=$($JQ -r '.gates.plan' "$STATE_FILE")

# === VALIDAÇÃO DE GATE: spec ===
# Se fase é plan ou posterior, spec deve estar aprovado
if [[ "$PHASE" =~ ^(plan|execute|validate|report|reflect|learn)$ ]]; then
  if [ "$GATESPEC" != "approved" ]; then
    echo "⛔ BLOQUEADO: Fase $PHASE requer SPEC GATE. Status: $GATESPEC"
    exit 2
  fi
fi

# === VALIDAÇÃO DE GATE: design ===
# Se fase é plan ou posterior, design deve estar aprovado (ou skipped)
if [[ "$PHASE" =~ ^(plan|execute|validate|report|reflect|learn)$ ]]; then
  if [ "$GATEDESIGN" != "approved" ] && [ "$GATEDESIGN" != "skipped" ]; then
    echo "⛔ BLOQUEADO: Fase $PHASE requer DESIGN GATE. Status: $GATEDESIGN"
    exit 2
  fi
fi

# === VALIDAÇÃO DE GATE: plan ===
# Se fase é execute ou posterior, plan deve estar aprovado
if [[ "$PHASE" =~ ^(execute|validate|report|reflect|learn)$ ]]; then
  if [ "$GATEPLAN" != "approved" ]; then
    echo "⛔ BLOQUEADO: Fase $PHASE requer PLAN GATE. Status: $GATEPLAN"
    exit 2
  fi
fi

# === CHECK: tool de escrita requer PLAN GATE ===
# Nomes reais do Claude Code: Edit, Write, MultiEdit
WRITE_TOOLS="Edit Write MultiEdit"
if echo "$WRITE_TOOLS" | grep -qw "$TOOL_NAME"; then
  if [ "$GATEPLAN" != "approved" ]; then
    echo "⛔ BLOQUEADO: Escrita ($TOOL_NAME) requer PLAN GATE aprovado."
    exit 2
  fi
fi

# === LOG DO TURN ===
# Incrementar turn counter atomicamente com jq + mktemp
TMP=$(mktemp_safe)
$JQ '.turns.current += 1' "$STATE_FILE" > "$TMP" && mv "$TMP" "$STATE_FILE"

# Escrever evento turn no JSONL
CURRENT=$($JQ -r '.turns.current' "$STATE_FILE")
event_logger event=turn turn=${CURRENT}@ phase="$PHASE" effort="$EFFORT"

# === ALERTA 80% ===
MAX=$($JQ -r '.turns.max' "$STATE_FILE")

if [ "$MAX" -gt 0 ]; then
  THRESHOLD=$((MAX * 80 / 100))
  
  if [ "$CURRENT" -ge "$THRESHOLD" ]; then
    WARNED=$($JQ -r '.turns.limit_80_warned' "$STATE_FILE")
    if [ "$WARNED" = "false" ]; then
      echo "⚠️ TURN $CURRENT/$MAX — 80% do limite atingido."
      TMP=$(mktemp_safe)
      $JQ '.turns.limit_80_warned = true' "$STATE_FILE" > "$TMP" && mv "$TMP" "$STATE_FILE"
    fi
  fi
fi

exit 0
