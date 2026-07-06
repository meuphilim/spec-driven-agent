#!/usr/bin/env node
/**
 * post-tool.js — Hook: após QUALQUER tool call
 * Chamado pelo Claude Code/OpenCode: PostToolUse
 *
 * Lê stdin JSON, captura eventos tool/agent no JSONL.
 * Cross-platform: Windows, Linux, macOS
 */

'use strict';

const { readStdinJson, appendEvent, appendHistory, getStateFile } = require('./_utils.js');
const fs = require('fs');

function main() {
  const payload = readStdinJson();
  const toolName = payload.tool_name || process.argv[2] || 'unknown';
  const toolResult = payload.tool_use_id || process.argv[3] || 'ok';
  const durationMs = payload.duration_ms || 0;
  const effort = payload.effort?.level || process.argv[4] || 'unknown';

  // Se state.json não existe, ignorar
  if (!fs.existsSync(getStateFile())) {
    process.exit(0);
  }

  const toolInput = payload.tool_input || {};

  // ─── Subagent tools (carregam dados de token) ───
  // Claude Code: Agent, Subagent, Task
  // OpenCode: Task, task, Subagent
  // NOTA: TaskCreate/TaskUpdate são TODOs, NÃO subagentes
  const SUBAGENT_TOOLS = new Set(['Agent', 'Subagent', 'Task', 'task']);
  const isSubagent = SUBAGENT_TOOLS.has(toolName);

  if (!isSubagent) {
    // ─── Tool comum (Read, Write, Edit, Bash, etc.) ───
    const filePath = toolInput.file_path || '';
    const command = toolInput.command || '';

    const event = {
      event: 'tool',
      tool: toolName,
      dur_ms: durationMs,
      effort: effort
    };

    if (filePath) {
      event.file = filePath;
    } else if (command) {
      // Truncar command para não poluir o JSONL
      event.command = command.slice(0, 80);
    }

    appendEvent(event);
  } else {
    // ─── Agent/Task — contém dados de token do subagente ───
    const toolResponse = payload.tool_response || {};

    // Extrair tipo de agente: tool_input.subagent_type (Task) ou payload.subagent_type
    let agentType = toolInput.subagent_type || payload.subagent_type || '';
    // Para Task tool sem subagent_type explícito, inferir do description
    if (!agentType && toolInput.description) {
      agentType = toolInput.description.includes('explore') ? 'explore' : 'general';
    }
    agentType = agentType || 'general';

    const resolvedModel = toolResponse.resolvedModel || toolResponse.model || '';
    const totalTokens = toolResponse.totalTokens || toolResponse.total_tokens;

    const event = {
      event: 'agent',
      agent_type: agentType,
      model: resolvedModel,
      dur_ms: toolResponse.totalDurationMs || toolResponse.duration_ms || durationMs,
      effort: effort,
      tool_use_id: payload.tool_use_id || ''
    };

    if (totalTokens != null && totalTokens !== '') {
      const usage = toolResponse.usage || toolResponse.token_usage || {};
      event.tokens = {
        total: parseInt(totalTokens, 10) || 0,
        input: parseInt(usage.input_tokens || usage.input || 0, 10),
        output: parseInt(usage.output_tokens || usage.output || 0, 10),
        cache_write: parseInt(usage.cache_creation_input_tokens || usage.cache_write || 0, 10),
        cache_read: parseInt(usage.cache_read_input_tokens || usage.cache_read || 0, 10)
      };
    } else {
      event.tokens = null;
    }

    // Contagem de tools usadas dentro do subagente
    if (toolInput.tools && Array.isArray(toolInput.tools)) {
      event.tool_count = toolInput.tools.length;
    }

    appendEvent(event);
  }

  // ─── History log ───
  appendHistory(`${toolName}:${toolResult}`);

  process.exit(0);
}

main();
