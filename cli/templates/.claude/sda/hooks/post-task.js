#!/usr/bin/env node
/**
 * post-task.js — Hook: após concluir tarefa
 * Escreve eventos task + gate no JSONL e executa compactação.
 * Cross-platform: Windows, Linux, macOS
 *
 * Uso: node post-task.js [skill] [duration_s] [success] [spec_name]
 */

'use strict';

const { readState, appendEvent, getHooksDir } = require('./_utils.js');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function main() {
  const skill = process.argv[2] || 'unknown';
  const duration = parseFloat(process.argv[3] || '0');
  const success = process.argv[4] !== 'false'; // default true
  const spec = process.argv[5] || 'unknown';

  // ─── Evento task ───
  appendEvent({
    event: 'task',
    skill: skill,
    spec: spec,
    success: success,
    dur_s: duration
  });

  // ─── Evento gate (aprovações) ───
  const state = readState();
  if (state && state.gates) {
    const g = state.gates;
    if (g.spec === 'approved') {
      appendEvent({ event: 'gate', gate: 'spec', status: 'approved', spec: spec });
    }
    if (g.design === 'approved') {
      appendEvent({ event: 'gate', gate: 'design', status: 'approved', spec: spec });
    }
    if (g.plan === 'approved') {
      appendEvent({ event: 'gate', gate: 'plan', status: 'approved', spec: spec });
    }
  }

  // ─── Compaction (1x/dia) ───
  const compactScript = path.join(getHooksDir(), 'events-compact.js');
  if (fs.existsSync(compactScript)) {
    spawnSync(process.execPath, [compactScript], { stdio: 'inherit' });
  }

  process.exit(0);
}

main();
