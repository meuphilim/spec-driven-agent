#!/bin/bash
# post-task.sh — Hook: após concluir tarefa
# Escreve eventos task + gate no JSONL.
# Antes escrevia metrics.json — agora usa append-only JSONL.
# Uso: bash hooks/post-task.sh [SKILL_NAME] [DURATION] [SUCCESS] [SPEC]

source "$(dirname "$0")/_utils.sh"

HOOKS_DIR="$(cd "$(dirname "$0")" && pwd)"
STATE_FILE="$HOOKS_DIR/state.json"

SKILL="${1:-unknown}"
DURATION="${2:-0}"
SUCCESS="${3:-true}"
SPEC="${4:-unknown}"

# ─── Evento task ───────────────────────────────────────────────────────────
event_logger event=task skill="$SKILL" spec="$SPEC" success=${SUCCESS}@ dur_s=${DURATION}@

# ─── Evento gate (aprovações) ─────────────────────────────────────────────
# Se state.json existe, ler gates aprovados
if [ -f "$STATE_FILE" ]; then
  GATE_SPEC=$($JQ -r '.gates.spec // "none"' "$STATE_FILE")
  GATE_DESIGN=$($JQ -r '.gates.design // "none"' "$STATE_FILE")
  GATE_PLAN=$($JQ -r '.gates.plan // "none"' "$STATE_FILE")
  
  [ "$GATE_SPEC" = "approved" ]   && event_logger event=gate gate=spec status=approved spec="$SPEC"
  [ "$GATE_DESIGN" = "approved" ] && event_logger event=gate gate=design status=approved spec="$SPEC"
  [ "$GATE_PLAN" = "approved" ]   && event_logger event=gate gate=plan status=approved spec="$SPEC"
fi

# metrics.json NÃO é mais escrito — usar JSONL + snapshots

# ─── Compaction (1x/dia) ────────────────────────────────────────────────────
bash "$HOOKS_DIR/events-compact.sh"

exit 0
