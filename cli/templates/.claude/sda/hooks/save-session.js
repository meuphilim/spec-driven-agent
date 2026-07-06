#!/usr/bin/env node
/**
 * save-session.js — Salva estado atual em .sessions/
 * Chamado por post-task e stop
 * Cross-platform: Windows, Linux, macOS
 */

'use strict';

const { saveSessionFile } = require('./_utils.js');

saveSessionFile();
console.log('✅ Estado salvo em .claude/sda/sessions/');
process.exit(0);
