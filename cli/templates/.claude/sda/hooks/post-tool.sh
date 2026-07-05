#!/bin/bash
# post-tool.sh — Hook: após QUALQUER tool call
# Chamado pelo Claude Code: PostToolUse
# Lê stdin JSON, captura eventos tool/agent no JSONL.
# Fallback para args posicionais ($1, $2) se stdin vazio.

source "$(dirname "$0")/_utils.sh"

STATE_FILE="$(dirname "$0")/state.json"
HOOKS_DIR="$(cd "$(dirname "$0")" && pwd)"

# Ler stdin (payload JSON do Claude Code) com fallback args posicionais
STDIN_JSON=$(stdin_read)
TOOL_NAME=$(echo "$STDIN_JSON" | $JQ -r '.tool_name // "'${1:-unknown}'"')
TOOL_RESULT=$(echo "$STDIN_JSON" | $JQ -r '.tool_use_id // "'${2:-ok}'"')
DURATION_MS=$(echo "$STDIN_JSON" | $JQ -r '.duration_ms // 0')
EFFORT=$(echo "$STDIN_JSON" | $JQ -r '.effort.level // "unknown"')

# Se state.json não existe, ignorar
[ ! -f "$STATE_FILE" ] && exit 0

# ─── Tool comum (Read, Write, Edit, Bash, etc.) ───────────────────────────
if [ "$TOOL_NAME" != "Agent" ]; then
  FILE_PATH=$(echo "$STDIN_JSON" | $JQ -r '.tool_input.file_path // ""')
  COMMAND=$(echo "$STDIN_JSON" | $JQ -r '.tool_input.command // ""')

  # Só incluir file se não estiver vazio
  if [ -n "$FILE_PATH" ] && [ "$FILE_PATH" != "null" ]; then
    event_logger "{\"event\":\"tool\",\"tool\":\"$TOOL_NAME\",\"file\":\"$FILE_PATH\",\"dur_ms\":$DURATION_MS,\"effort\":\"$EFFORT\"}"
  elif [ -n "$COMMAND" ] && [ "$COMMAND" != "null" ]; then
    # Truncar command para não poluir o JSONL
    COMMAND_TRUNC=$(echo "$COMMAND" | head -c 80)
    event_logger "{\"event\":\"tool\",\"tool\":\"$TOOL_NAME\",\"command\":\"$COMMAND_TRUNC\",\"dur_ms\":$DURATION_MS,\"effort\":\"$EFFORT\"}"
  else
    event_logger "{\"event\":\"tool\",\"tool\":\"$TOOL_NAME\",\"dur_ms\":$DURATION_MS,\"effort\":\"$EFFORT\"}"
  fi

# ─── Agent/Subagent — contém dados de token ───────────────────────────────
else
  AGENT_TYPE=$(echo "$STDIN_JSON" | $JQ -r '.tool_input.subagent_type // "general"')
  RESPONSE_STATUS=$(echo "$STDIN_JSON" | $JQ -r '.tool_response.status // "completed"')
  RESOLVED_MODEL=$(echo "$STDIN_JSON" | $JQ -r '.tool_response.resolvedModel // ""')
  TOTAL_TOKENS=$(echo "$STDIN_JSON" | $JQ -r '.tool_response.totalTokens // "null"')
  TOTAL_DURATION=$(echo "$STDIN_JSON" | $JQ -r '.tool_response.totalDurationMs // 0')

  # Verificar se há dados reais de token (disponível apenas para subagentes síncronos)
  if [ "$TOTAL_TOKENS" != "null" ] && [ "$TOTAL_TOKENS" != "" ]; then
    INPUT_TOKENS=$(echo "$STDIN_JSON" | $JQ -r '.tool_response.usage.input_tokens // 0')
    OUTPUT_TOKENS=$(echo "$STDIN_JSON" | $JQ -r '.tool_response.usage.output_tokens // 0')
    CACHE_WRITE=$(echo "$STDIN_JSON" | $JQ -r '.tool_response.usage.cache_creation_input_tokens // 0')
    CACHE_READ=$(echo "$STDIN_JSON" | $JQ -r '.tool_response.usage.cache_read_input_tokens // 0')

    event_logger "{\"event\":\"agent\",\"agent_type\":\"$AGENT_TYPE\",\"model\":\"$RESOLVED_MODEL\",\"dur_ms\":$TOTAL_DURATION,\"effort\":\"$EFFORT\",\"tokens\":{\"total\":$TOTAL_TOKENS,\"input\":$INPUT_TOKENS,\"output\":$OUTPUT_TOKENS,\"cache_write\":$CACHE_WRITE,\"cache_read\":$CACHE_READ}}"
  else
    # Subagente background ou sem dados de token
    event_logger "{\"event\":\"agent\",\"agent_type\":\"$AGENT_TYPE\",\"model\":\"$RESOLVED_MODEL\",\"dur_ms\":$TOTAL_DURATION,\"effort\":\"$EFFORT\",\"tokens\":null}"
  fi
fi

# ─── History log (compatibilidade) ────────────────────────────────────────
LOG_FILE="$HOOKS_DIR/state.history.log"
TIMESTAMP=$(date -u +"%H:%M:%S")
echo "$TIMESTAMP:$TOOL_NAME:$TOOL_RESULT" >> "$LOG_FILE"

# Rotação: manter só últimas 500 linhas
if [ -f "$LOG_FILE" ]; then
  LINE_COUNT=$(wc -l < "$LOG_FILE" 2>/dev/null || echo 0)
  if [ "$LINE_COUNT" -gt 500 ]; then
    tail -500 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
  fi
fi

exit 0
