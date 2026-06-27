#!/bin/bash
# post-task.sh — Hook: após concluir tarefa
# Coleta métricas de uso para dashboard
# Uso: bash hooks/post-task.sh [TASK_NAME] [TASK_TYPE] [RESULT]

source "$(dirname "$0")/_utils.sh"

HOOKS_DIR="$(dirname "$0")"
METRICS_FILE="$(dirname "$0")/../metrics.json"
STATE_FILE="$HOOKS_DIR/state.json"

# Se state.json não existe, ignorar
[ ! -f "$STATE_FILE" ] && exit 0

TASK_NAME="${1:-unknown}"
TASK_TYPE="${2:-unknown}"
TASK_RESULT="${3:-success}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Criar metrics.json se não existe
if [ ! -f "$METRICS_FILE" ]; then
  echo '{"tasks":[],"skills_used":{},"gates":{},"sessions":[]}' > "$METRICS_FILE"
fi

# Extrair dados do state.json
CURRENT_TURN=$($JQ '.turns.current // 0' "$STATE_FILE" 2>/dev/null || echo 0)
PHASE=$($JQ '.phase // "unknown"' "$STATE_FILE" 2>/dev/null || echo "unknown")
PROJECT=$($JQ '.project // "unknown"' "$STATE_FILE" 2>/dev/null || echo "unknown")

# Adicionar tarefa ao array
TMP=$(mktemp)
$JQ --arg name "$TASK_NAME" \
    --arg type "$TASK_TYPE" \
    --arg result "$TASK_RESULT" \
    --arg ts "$TIMESTAMP" \
    --argjson turns "$CURRENT_TURN" \
    --arg phase "$PHASE" \
    '.tasks += [{
      "name": $name,
      "type": $type,
      "result": $result,
      "timestamp": $ts,
      "turns": $turns,
      "phase": $phase
    }]' "$METRICS_FILE" > "$TMP" && mv "$TMP" "$METRICS_FILE"

# Atualizar contagem de skills usadas
if [ "$TASK_TYPE" != "unknown" ]; then
  TMP=$(mktemp)
  $JQ --arg type "$TASK_TYPE" \
      '.skills_used[$type] = ((.skills_used[$type] // 0) + 1)' \
      "$METRICS_FILE" > "$TMP" && mv "$TMP" "$METRICS_FILE"
fi

# Manter só últimas 100 tarefas
TMP=$(mktemp)
$JQ '.tasks = .tasks[-100:]' "$METRICS_FILE" > "$TMP" && mv "$TMP" "$METRICS_FILE"

exit 0
