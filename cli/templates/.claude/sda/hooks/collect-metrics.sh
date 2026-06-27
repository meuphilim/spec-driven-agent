#!/bin/bash
# collect-metrics.sh — Coleta métricas de uso do framework
# Chamado por post-task para registrar dados da sessão
# Uso: bash hooks/collect-metrics.sh [SKILL_NAME] [DURATION] [SUCCESS]

source "$(dirname "$0")/_utils.sh"

METRICS_FILE="$(dirname "$0")/../metrics.json"
SKILL="${1:-unknown}"
DURATION="${2:-0}"
SUCCESS="${3:-true}"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Se metrics.json não existe, criar com estrutura base
if [ ! -f "$METRICS_FILE" ]; then
  $JQ -n '{
    total_sessions: 0,
    total_tasks: 0,
    skills_used: {},
    daily_usage: {},
    gate_stats: { spec: 0, plan: 0, reflect: 0 },
    avg_duration: 0,
    success_rate: 0
  }' > "$METRICS_FILE"
fi

# Atualizar métricas com jq
TMP=$(mktemp)
$JQ \
  --arg skill "$SKILL" \
  --arg ts "$TIMESTAMP" \
  --arg dur "$DURATION" \
  --arg success "$SUCCESS" \
  --arg day "$(date -u +%Y-%m-%d)" \
  '
  .total_tasks += 1 |
  .skills_used[$skill] = (.skills_used[$skill] // 0) + 1 |
  .daily_usage[$day] = (.daily_usage[$day] // 0) + 1 |
  .avg_duration = ((.avg_duration * (.total_tasks - 1) + ($dur | tonumber)) / .total_tasks) |
  if $success == "true" then
    .success_rate = ((.success_rate * (.total_tasks - 1) + 100) / .total_tasks)
  else
    .success_rate = ((.success_rate * (.total_tasks - 1)) / .total_tasks)
  end
  ' "$METRICS_FILE" > "$TMP" && mv "$TMP" "$METRICS_FILE"

exit 0
