#!/bin/bash
# init-session.sh — Inicializa state.json para nova sessão
# Chamado pelo agente no início da sessão
# Uso: bash hooks/init-session.sh [PROJECT_NAME] [SESSION_ID]

source "$(dirname "$0")/_utils.sh"

STATE_FILE="$(dirname "$0")/state.json"
PROJECT="${1:-unknown}"
SESSION_ID="${2:-$(date +%Y-%m-%d)-$PROJECT}"

if [ -n "$JQ" ]; then
  # Seguro: jq constrói JSON com escaped values
  TMP=$(mktemp)
  $JQ -n \
    --arg sid "$SESSION_ID" \
    --arg proj "$PROJECT" \
    --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    '{
      session_id: $sid,
      project: $proj,
      started_at: $ts,
      phase: "init",
      classify: {},
      turns: { current: 0, max: 40, limit_80_warned: false },
      gates: { spec: "none", plan: "none", reflect: "none" },
      active_spec: null,
      scope_keywords: [],
      session_file: null,
      intentional_stop: false
    }' > "$TMP" && mv "$TMP" "$STATE_FILE"
else
  # Fallback: sanitizar variáveis manualmente
  SAFE_PROJECT=$(echo "$PROJECT" | tr -d '"\\')
  SAFE_SESSION=$(echo "$SESSION_ID" | tr -d '"\\')
  cat > "$STATE_FILE" <<EOF
{
  "session_id": "$SAFE_SESSION",
  "project": "$SAFE_PROJECT",
  "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "phase": "init",
  "classify": {},
  "turns": { "current": 0, "max": 40, "limit_80_warned": false },
  "gates": { "spec": "none", "plan": "none", "reflect": "none" },
  "active_spec": null,
  "scope_keywords": [],
  "session_file": null,
  "intentional_stop": false
}
EOF
fi

echo "✅ Sessão inicializada: $SESSION_ID"
