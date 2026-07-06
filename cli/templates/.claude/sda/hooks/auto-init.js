#!/usr/bin/env node
/**
 * auto-init.js — Inicializa sessão automaticamente ao abrir o Claude Code/OpenCode
 *
 * Disparado pelo hook SessionStart. Verifica se state.json existe e está vazio.
 * Se sim, executa sda hooks init com o nome do diretório.
 *
 * Cross-platform: Windows, Linux, macOS
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const STATE_FILE = path.join(__dirname, 'state.json');
const HOOKS_DIR = __dirname;

function getProjectName() {
  return path.basename(process.cwd());
}

/**
 * Executa `sda hooks init <project>` de forma cross-platform.
 * No Windows, npm gera .cmd, não executável via node direto.
 */
function runSdaInit(projectName) {
  const isWin = process.platform === 'win32';

  // Estratégia 1: CLI.js do npm global (Windows + Unix)
  const globalCliJs = isWin
    ? path.join(process.env.APPDATA || '', 'npm', 'node_modules', 'spec-driven-agent', 'bin', 'cli.js')
    : '/usr/local/lib/node_modules/spec-driven-agent/bin/cli.js';

  if (fs.existsSync(globalCliJs)) {
    return spawnSync(process.execPath, [globalCliJs, 'hooks', 'init', projectName], {
      cwd: process.cwd(),
      stdio: 'inherit',
      timeout: 15000
    });
  }

  // Estratégia 2: Via shell (usa o .cmd no Windows, shebang no Unix)
  const cmd = isWin ? 'sda.cmd' : 'sda';
  return spawnSync(cmd, ['hooks', 'init', projectName], {
    cwd: process.cwd(),
    stdio: 'inherit',
    timeout: 15000,
    shell: isWin // No Windows, precisa do shell para resolver .cmd
  });
}

function needsInit() {
  try {
    if (!fs.existsSync(STATE_FILE)) return true;
    const content = fs.readFileSync(STATE_FILE, 'utf8').trim();
    if (!content) return true;
    const state = JSON.parse(content);
    if (!state.session_id || state.session_id === '') return true;
    return false;
  } catch (_) {
    return true;
  }
}

function autoInit() {
  if (!needsInit()) {
    process.exit(0);
  }

  const projectName = getProjectName();
  console.log(`📦 SDA: Inicializando sessão automática para "${projectName}"...`);

  try {
    const result = runSdaInit(projectName);
    if (result.status === 0) {
      console.log(`✅ SDA: Sessão "${projectName}" iniciada automaticamente.`);
    } else {
      console.error(`⚠️ SDA: Falha ao iniciar sessão automática (exit: ${result.status})`);
    }
  } catch (err) {
    console.error(`⚠️ SDA: Erro ao iniciar sessão: ${err.message}`);
  }

  process.exit(0);
}

autoInit();
