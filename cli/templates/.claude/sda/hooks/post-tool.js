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

  if (toolName !== 'Agent' && toolName !== 'Subagent') {
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
    // ─── Agent/Subagent — contém dados de token ───
    const toolResponse = payload.tool_response || {};
    const agentType = toolInput.subagent_type || payload.subagent_type || 'general';
    const responseStatus = toolResponse.status || 'completed';
    const resolvedModel = toolResponse.resolvedModel || '';
    const totalTokens = toolResponse.totalTokens;

    const event = {
      event: 'agent',
      agent_type: agentType,
      model: resolvedModel,
      dur_ms: toolResponse.totalDurationMs || durationMs,
      effort: effort
    };

    if (totalTokens != null && totalTokens !== '') {
      const usage = toolResponse.usage || {};
      event.tokens = {
        total: totalTokens,
        input: usage.input_tokens || 0,
        output: usage.output_tokens || 0,
        cache_write: usage.cache_creation_input_tokens || 0,
        cache_read: usage.cache_read_input_tokens || 0
      };
    } else {
      event.tokens = null;
    }

    appendEvent(event);
  }

  // ─── History log ───
  appendHistory(`${toolName}:${toolResult}`);

  process.exit(0);
}

main();
