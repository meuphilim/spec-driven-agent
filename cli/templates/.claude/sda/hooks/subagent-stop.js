#!/usr/bin/env node
/**
 * subagent-stop.js — Hook: SubagentStop
 * Chamado pelo Claude Code quando um subagente termina.
 *
 * Captura dados de ciclo de vida do subagente: tipo, id,
 * caminho do transcript e última mensagem para métricas no dashboard.
 *
 * Cross-platform: Windows, Linux, macOS
 */

'use strict';

const { readStdinJson, appendEvent } = require('./_utils.js');

function main() {
  const payload = readStdinJson();

  const agentId = payload.agent_id || '';
  const agentType = payload.agent_type || '';
  const transcriptPath = payload.agent_transcript_path || '';
  const lastMessage = payload.last_assistant_message || '';
  const backgroundTasks = Array.isArray(payload.background_tasks) ? payload.background_tasks.length : 0;

  appendEvent({
    event: 'subagent_stop',
    agent_id: agentId,
    agent_type: agentType,
    transcript_path: transcriptPath,
    last_message_length: lastMessage.length,
    background_tasks: backgroundTasks
  });

  process.exit(0);
}

main();
