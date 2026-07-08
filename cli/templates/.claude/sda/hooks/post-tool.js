#!/usr/bin/env node
/**
 * post-tool.js — Hook: após QUALQUER tool call
 * Chamado pelo Claude Code/OpenCode: PostToolUse
 *
 * Lê stdin JSON, captura eventos tool/agent no JSONL.
 * Cross-platform: Windows, Linux, macOS
 */

'use strict';

const { readStdinJson, readState, writeState, appendEvent, appendHistory, getStateFile } = require('./_utils.js');
const fs = require('fs');

function main() {
  const payload = readStdinJson();
  const toolName = payload.tool_name || process.argv[2] || 'unknown';
  const toolResult = payload.tool_use_id || process.argv[3] || 'ok';
  const durationMs = payload.duration_ms || 0;
  const effort = payload.effort?.level || process.argv[4] || 'unknown';

  // Se state.json não existe, ignorar
  const stateFile = getStateFile();
  if (!fs.existsSync(stateFile)) {
    process.exit(0);
  }

  // ─── Auto-detecção de mode via effort.level ───
  // No primeiro PostToolUse da sessão, detecta se o esforço é "low" (LITE)
  // e atualiza state.mode se ainda não foi definido explicitamente
  try {
    const state = readState();
    if (state && state.session_id) {
      const currentMode = state.mode || 'FULL';
      if (effort === 'low' && currentMode === 'FULL') {
        state.mode = 'LITE';
        writeState(state);
        appendEvent({
          event: 'mode_change',
          mode: 'LITE',
          effort: effort,
          previous_mode: 'FULL'
        });
      }
    }
  } catch (_) {
    // Ignora erro na detecção de mode — não crítico
  }

  const toolInput = payload.tool_input || {};

  // ─── Subagent tools (carregam dados de token) ───
  // Claude Code: Agent
  // NOTA: apenas Claude Code é suportado neste hook
  const SUBAGENT_TOOLS = new Set(['Agent', 'Subagent']);
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
    // ─── Agent — contém dados de token do subagente ───
    const toolResponse = payload.tool_response || {};
    const agentStatus = toolResponse.status || '';

    // Só captura tokens quando o subagente completou (status "completed")
    // Em "async_launched", o subagente ainda está rodando — tokens não disponíveis
    if (agentStatus === 'async_launched') {
      appendEvent({
        event: 'agent_launch',
        agent_id: toolResponse.agentId || '',
        agent_type: toolInput.subagent_type || 'general',
        effort: effort
      });
      appendHistory(`${toolName}:async_launched`);
      process.exit(0);
    }

    // Extrair tipo de agente
    let agentType = toolInput.subagent_type || payload.subagent_type || '';
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
