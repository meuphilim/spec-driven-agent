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
  TMP=$(mktemp_safe)
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
      gates: { spec: "none", design: "none", plan: "none", validate: "none", reflect: "none" },
      active_spec: null,
      scope_keywords: [],
      session_file: null,
      intentional_stop: false
    }' > "$TMP" && mv "$TMP" "$STATE_FILE"
else
  # Fallback: usar node para JSON seguro (process.argv lida com escaping)
  # tr -d removido: dava falsa segurança (não protegia $() ou ` no shell)
  node -e "
    const fs = require('fs');
    const state = {
      session_id: process.argv[1],
      project: process.argv[2],
      started_at: new Date().toISOString(),
      phase: 'init',
      classify: {},
      turns: { current: 0, max: 40, limit_80_warned: false },
      gates: { spec: 'none', design: 'none', plan: 'none', validate: 'none', reflect: 'none' },
      active_spec: null,
      scope_keywords: [],
      session_file: null,
      intentional_stop: false
    };
    fs.writeFileSync(process.argv[3], JSON.stringify(state, null, 2));
  " "$SESSION_ID" "$PROJECT" "$STATE_FILE"
fi

# Escrever evento session_start no JSONL
MODEL="${3:-unknown}"
MODE="${4:-FULL}"
event_logger event=session_start session_id="$SESSION_ID" project="$PROJECT" model="$MODEL" mode="$MODE"

echo "✅ Sessão inicializada: $SESSION_ID"
