#!/usr/bin/env node
/**
 * stop.js — Hook: quando agente termina resposta ou é interrompido
 * Chamado pelo Claude Code/OpenCode: Stop
 *
 * Salva estado, registra session_end, persiste sessão.
 * Cross-platform: Windows, Linux, macOS
 */

'use strict';

const { readState, writeState, appendEvent, saveSessionFile, getStateFile } = require('./_utils.js');
const fs = require('fs');

function main() {
  // Se state.json não existe, ignorar
  if (!fs.existsSync(getStateFile())) {
    process.exit(0);
  }

  const state = readState();
  if (!state) process.exit(0);

  const phase = state.phase || 'init';
  const intentional = state.intentional_stop || false;
  const current = state.turns?.current || 0;

  // Só alertar se interrupção NÃO intencional
  if (!intentional && phase !== 'done') {
    console.log(`⚠️ SESSÃO INTERROMPIDA — Fase: ${phase} (turn ${current})`);
    console.log('📋 Execute /reflect antes de encerrar');
  }

  // ─── Task event (auto-tracked a cada Stop para o dashboard) ───
  const now = new Date();
  const prevTs = state._last_stop_ts ? new Date(state._last_stop_ts).getTime() : null;
  const dur_s = prevTs ? Math.round((now.getTime() - prevTs) / 1000) : 0;

  appendEvent({
    event: 'task',
    skill: phase,
    spec: state.active_spec || '—',
    success: true,
    dur_s: dur_s
  });

  state._last_stop_ts = now.toISOString();
  writeState(state);

  // Escrever evento session_end no JSONL
  appendEvent({
    event: 'session_end',
    session_id: state.session_id || 'unknown',
    reason: intentional ? 'completed' : 'stop'
  });

  // Salvar sessão em .sessions/
  saveSessionFile();

  process.exit(0);
}

main();
