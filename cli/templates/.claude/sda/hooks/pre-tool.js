#!/usr/bin/env node
/**
 * pre-tool.js — Hook: antes de QUALQUER tool call
 * Chamado pelo Claude Code/OpenCode: PreToolUse
 *
 * Lê stdin (payload JSON), valida GATEs, incrementa turn counter.
 * Exit: 0 = ok, 2 = bloqueado
 *
 * Cross-platform: Windows, Linux, macOS
 */

'use strict';

const { readStdinJson, readState, writeState, appendEvent, getStateFile } = require('./_utils.js');

function main() {
  const payload = readStdinJson();
  const toolName = payload.tool_name || process.argv[2] || 'unknown';

  // Se state.json não existe, ignorar (primeira tool da sessão)
  if (!require('fs').existsSync(getStateFile())) {
    process.exit(0);
  }

  const state = readState();
  if (!state) process.exit(0);

  const phase = state.phase || 'init';
  const gates = state.gates || {};

  // === ESCAPE HATCH: SDA_BYPASS_GATE ===
  // Define SDA_BYPASS_GATE=true no ambiente para desabilitar todas as validações
  // Útil para emergências (ex.: deadlock) e debugging
  if (process.env.SDA_BYPASS_GATE === 'true' || process.env.SDA_BYPASS_GATE === '1') {
    process.exit(0);
  }

  // === WHITELIST: state.json pode sempre ser editado ===
  // Previne deadlock: editar state.json para aprovar gates não deve ser bloqueado
  // Detecta tanto caminhos com / (Unix) quanto \\ (Windows)
  const toolInput = payload.tool_input || {};
  const targetPath = (toolInput.filePath || toolInput.path || '').replace(/\\/g, '/');
  if (targetPath.endsWith('/state.json') || targetPath.endsWith('state.json')) {
    process.exit(0);
  }

  // === VALIDAÇÃO DE GATES ===
  const blockReasons = [];

  // Fases que requerem gates
  const needsSpec = ['plan', 'execute', 'validate', 'report', 'reflect', 'learn'];
  const needsDesign = ['plan', 'execute', 'validate', 'report', 'reflect', 'learn'];
  const needsPlan = ['execute', 'validate', 'report', 'reflect', 'learn'];

  if (needsSpec.includes(phase) && gates.spec !== 'approved') {
    blockReasons.push(`Fase ${phase} requer SPEC GATE. Status: ${gates.spec}`);
  }

  if (needsDesign.includes(phase) && gates.design !== 'approved' && gates.design !== 'skipped') {
    blockReasons.push(`Fase ${phase} requer DESIGN GATE. Status: ${gates.design}`);
  }

  if (needsPlan.includes(phase) && gates.plan !== 'approved') {
    blockReasons.push(`Fase ${phase} requer PLAN GATE. Status: ${gates.plan}`);
  }

  // Tool de escrita requer PLAN GATE
  const writeTools = ['Edit', 'Write', 'MultiEdit'];
  if (writeTools.includes(toolName) && gates.plan !== 'approved') {
    blockReasons.push(`Escrita (${toolName}) requer PLAN GATE aprovado.`);
  }

  if (blockReasons.length > 0) {
    console.error('⛔ BLOQUEADO: ' + blockReasons.join(' | '));
    process.exit(2);
  }

  // === LOG DO TURN ===
  state.turns = state.turns || { current: 0, max: 40, limit_80_warned: false };
  state.turns.current += 1;

  // Escrever evento turn no JSONL
  const effort = payload.effort?.level || process.argv[3] || 'unknown';
  appendEvent({
    event: 'turn',
    turn: state.turns.current,
    phase: phase,
    effort: effort
  });

  // === ALERTA 80% ===
  const maxTurns = state.turns.max || 40;
  if (maxTurns > 0) {
    const threshold = Math.floor(maxTurns * 80 / 100);
    if (state.turns.current >= threshold && !state.turns.limit_80_warned) {
      console.log(`⚠️ TURN ${state.turns.current}/${maxTurns} — 80% do limite atingido.`);
      state.turns.limit_80_warned = true;
    }
  }

  writeState(state);
  process.exit(0);
}

main();
