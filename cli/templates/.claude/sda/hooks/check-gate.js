#!/usr/bin/env node
/**
 * check-gate.js — Helper: valida estado de um GATE
 * Escreve evento gate no JSONL se aprovado.
 * Cross-platform: Windows, Linux, macOS
 *
 * Uso: node check-gate.js [spec|design|plan|validate|reflect] [SPEC_NAME]
 */

'use strict';

const { readState, appendEvent } = require('./_utils.js');

function main() {
  const gateName = process.argv[2] || 'spec';
  const specName = process.argv[3] || 'unknown';

  const state = readState();
  if (!state) process.exit(1);

  const status = (state.gates || {})[gateName] || 'none';
  console.log(status);

  if (status === 'approved') {
    appendEvent({
      event: 'gate',
      gate: gateName,
      status: 'approved',
      spec: specName
    });
  }

  process.exit(0);
}

main();
