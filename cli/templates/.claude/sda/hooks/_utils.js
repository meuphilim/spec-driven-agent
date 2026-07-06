/**
 * _utils.js — Utilitários compartilhados pelos hooks (Node.js puro)
 *
 * Funciona em Windows, Linux e macOS sem dependências externas.
 * Substitui _utils.sh para ambientes sem bash/jq.
 *
 * Uso: const { readState, appendEvent, ... } = require('./_utils.js');
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Caminhos ──────────────────────────────────────────────────────────────

/** Diretório onde este script está */
function getHooksDir() {
  return __dirname;
}

/** Caminho do state.json */
function getStateFile() {
  return path.join(getHooksDir(), 'state.json');
}

/** Caminho do diretório metrics */
function getMetricsDir() {
  return path.join(getHooksDir(), '..', 'metrics');
}

/** Caminho do diretório sessions */
function getSessionsDir() {
  return path.join(getHooksDir(), '..', 'sessions');
}

/**
 * Lê todo o stdin e retorna como string.
 * Fallback para "{}" se não houver dados.
 */
function readStdin() {
  try {
    const buffer = fs.readFileSync(0, 'utf8'); // fd 0 = stdin
    return buffer.trim() || '{}';
  } catch (_) {
    return '{}';
  }
}

/**
 * Lê stdin e faz parse como JSON.
 * @returns {object}
 */
function readStdinJson() {
  try {
    return JSON.parse(readStdin());
  } catch (_) {
    return {};
  }
}

// ─── State ─────────────────────────────────────────────────────────────────

/**
 * Lê e retorna o state.json como objeto.
 * @returns {object|null} - null se não existir ou for inválido
 */
function readState() {
  const sf = getStateFile();
  if (!fs.existsSync(sf)) return null;
  try {
    return JSON.parse(fs.readFileSync(sf, 'utf8'));
  } catch (_) {
    return null;
  }
}

/**
 * Escreve state.json de forma atômica (tmp + mv).
 * @param {object} state
 */
function writeState(state) {
  const sf = getStateFile();
  const tmp = sf + '.tmp.' + process.pid;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2) + '\n');
  fs.renameSync(tmp, sf);
}

// ─── Event Logger ──────────────────────────────────────────────────────────

/**
 * Appenda um evento JSONL no arquivo do mês atual.
 * Cria diretório metrics/ se não existir.
 * @param {object} event - Objeto do evento
 */
function appendEvent(event) {
  const now = new Date();
  const month = now.toISOString().slice(0, 7); // YYYY-MM
  const metricsDir = getMetricsDir();

  if (!fs.existsSync(metricsDir)) {
    fs.mkdirSync(metricsDir, { recursive: true });
  }

  const file = path.join(metricsDir, `events-${month}.jsonl`);

  // Garantir timestamp
  if (!event.ts) {
    event.ts = now.toISOString();
  }

  fs.appendFileSync(file, JSON.stringify(event) + '\n');
}

// ─── History Log ───────────────────────────────────────────────────────────

/**
 * Adiciona entrada no history log com rotação (últimas 500 linhas).
 * @param {string} line - Linha formatada "HH:MM:SS:tool:result"
 */
function appendHistory(line) {
  const logFile = path.join(getHooksDir(), 'state.history.log');
  const ts = new Date().toISOString().slice(11, 19);
  fs.appendFileSync(logFile, `${ts}:${line}\n`);

  // Rotação: manter só últimas 500 linhas
  try {
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n');
    if (lines.length > 500) {
      fs.writeFileSync(logFile, lines.slice(-500).join('\n'));
    }
  } catch (_) {
    // Ignorar erros de rotação
  }
}

// ─── Session ───────────────────────────────────────────────────────────────

/**
 * Salva estado atual em .sessions/SESSION_ID.md
 */
function saveSessionFile() {
  const state = readState();
  if (!state || !state.session_id) return;

  const sessionsDir = getSessionsDir();
  if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
  }

  const output = path.join(sessionsDir, `${state.session_id}.md`);
  const now = new Date().toISOString().slice(11, 19);
  const entry = `
---

## Estado ao Interromper (${now})
- Fase: ${state.phase}
- Turns: ${state.turns.current}`;

  fs.appendFileSync(output, entry);
}

module.exports = {
  getHooksDir,
  getStateFile,
  getMetricsDir,
  getSessionsDir,
  readStdin,
  readStdinJson,
  readState,
  writeState,
  appendEvent,
  appendHistory,
  saveSessionFile
};
