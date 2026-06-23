#!/bin/bash
# init-session.sh — Inicializa state.json para nova sessão
# Chamado pelo agente no início da sessão
# Uso: bash hooks/init-session.sh [PROJECT_NAME] [SESSION_ID]

STATE_FILE="$(dirname "$0")/state.json"
PROJECT="${1:-unknown}"
SESSION_ID="${2:-$(date +%Y-%m-%d)-$PROJECT}"

cat > "$STATE_FILE" <<EOF
{
  "session_id": "$SESSION_ID",
  "project": "$PROJECT",
  "started_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "phase": "init",
  "classify": {},
  "turns": { "current": 0, "max": 40, "limit_80_warned": false },
  "gates": { "spec": "none", "plan": "none", "reflect": "none" },
  "active_spec": null,
  "scope_keywords": [],
  "session_file": null,
  "intentional_stop": false,
  "history": ["init:session_started"]
}
EOF

echo "✅ Sessão inicializada: $SESSION_ID"
