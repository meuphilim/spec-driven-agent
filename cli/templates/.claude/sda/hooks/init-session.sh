#!/bin/bash
# init-session.sh — Inicializa state.json para nova sessão
# Chamado pelo agente no início da sessão
# Uso: bash hooks/init-session.sh [PROJECT_NAME] [SESSION_ID]

STATE_FILE="$(dirname "$0")/state.json"
PROJECT="${1:-unknown}"
SESSION_ID="${2:-$(date +%Y-%m-%d)-$PROJECT}"

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
  echo "⚠️ jq não encontrado. Usando fallback inseguro."
  JQ=""
fi

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
      intentional_stop: false,
      history: ["init:session_started"]
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
  "intentional_stop": false,
  "history": ["init:session_started"]
}
EOF
fi

echo "✅ Sessão inicializada: $SESSION_ID"
