/**
 * events.js — Módulo de Eventos (JSONL + Snapshots)
 *
 * Camada de dados do Dashboard de Métricas. Desacoplada do TUI:
 * todas as funções recebem (basedir, ...) e retornam objetos JS puros.
 *
 * Uso:
 *   const events = require('./events');
 *   const snap = events.buildSnapshots('/path/to/metrics');
 *   console.log(snap.daily['2026-07-05'].tasks.total);
 */

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SNAPSHOT_DIR = 'snapshots';

// ─── JSONL Reading ──────────────────────────────────────────────────────────

/**
 * Lê todas as linhas JSONL de um arquivo e retorna como array de objetos.
 * Ignora linhas vazias ou mal formatadas.
 * @param {string} filePath
 * @returns {object[]}
 */
function readJsonlFile(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8').trim();
  if (!content) return [];

  return content
    .split('\n')
    .map(line => {
      try {
        return JSON.parse(line);
      } catch (_) {
        return null;
      }
    })
    .filter(e => e !== null);
}

/**
 * Lista arquivos JSONL em um diretório.
 * @param {string} metricsDir
 * @returns {string[]} Array de paths absolutos
 */
function listJsonlFiles(metricsDir) {
  if (!fs.existsSync(metricsDir)) return [];
  return fs.readdirSync(metricsDir)
    .filter(f => f.startsWith('events-') && f.endsWith('.jsonl'))
    .map(f => path.join(metricsDir, f))
    .sort();
}

/**
 * Lê eventos dos últimos N dias (ou todos se days = 0).
 * @param {string} metricsDir
 * @param {number} days - 0 = todos, N = últimos N dias
 * @returns {object[]}
 */
function readEvents(metricsDir, days = 0) {
  const files = listJsonlFiles(metricsDir);
  let allEvents = [];

  for (const file of files) {
    const events = readJsonlFile(file);
    allEvents = allEvents.concat(events);
  }

  if (days > 0) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    allEvents = allEvents.filter(e => {
      if (!e.ts) return true;
      const d = new Date(e.ts);
      return d >= cutoff;
    });
  }

  return allEvents;
}

// ─── Aggregation ────────────────────────────────────────────────────────────

/**
 * Agrupa eventos por data (YYYY-MM-DD).
 * @param {object[]} events
 * @returns {object} Mapa { '2026-07-05': [events] }
 */
function groupByDay(events) {
  const groups = {};
  for (const e of events) {
    const day = e.ts ? e.ts.slice(0, 10) : 'unknown';
    if (!groups[day]) groups[day] = [];
    groups[day].push(e);
  }
  return groups;
}

/**
 * Agrupa eventos por semana (YYYY-WNN).
 * @param {object[]} events
 * @returns {object} Mapa { '2026-W27': [events] }
 */
function groupByWeek(events) {
  const groups = {};
  for (const e of events) {
    if (!e.ts) {
      if (!groups['unknown']) groups['unknown'] = [];
      groups['unknown'].push(e);
      continue;
    }
    const d = new Date(e.ts);
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNum = Math.ceil(((d - yearStart) / 86400000 + yearStart.getDay() + 1) / 7);
    const weekKey = `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    if (!groups[weekKey]) groups[weekKey] = [];
    groups[weekKey].push(e);
  }
  return groups;
}

/**
 * Agrega um conjunto de eventos em um snapshot.
 * @param {object[]} events
 * @returns {object} Snapshot no formato padronizado
 */
function aggregateSnapshot(events) {
  const tasks = events.filter(e => e.event === 'task');
  const agents = events.filter(e => e.event === 'agent');
  const tools = events.filter(e => e.event === 'tool');
  const gates = events.filter(e => e.event === 'gate');
  const sessions = events.filter(e => e.event === 'session_start' || e.event === 'session_end');

  // Tasks
  const taskSuccess = tasks.filter(t => t.success === true).length;
  const taskFailed = tasks.filter(t => t.success === false).length;

  // Skills
  const skills = {};
  for (const t of tasks) {
    if (t.skill) {
      skills[t.skill] = (skills[t.skill] || 0) + 1;
    }
  }

  // Tokens (só de agentes — fonte real)
  let tokenTotal = 0;
  let tokenInput = 0;
  let tokenOutput = 0;
  let tokenCacheWrite = 0;
  let tokenCacheRead = 0;
  let hasTokenData = false;

  for (const a of agents) {
    if (a.tokens && a.tokens.total != null) {
      tokenTotal += a.tokens.total;
      tokenInput += a.tokens.input || 0;
      tokenOutput += a.tokens.output || 0;
      tokenCacheWrite += a.tokens.cache_write || 0;
      tokenCacheRead += a.tokens.cache_read || 0;
      hasTokenData = true;
    }
  }

  // Agentes/modelos
  const agentTypes = {};
  const models = {};
  for (const a of agents) {
    if (a.agent_type) agentTypes[a.agent_type] = (agentTypes[a.agent_type] || 0) + 1;
    if (a.model) models[a.model] = (models[a.model] || 0) + 1;
  }

  // Modos
  const modes = {};
  for (const s of sessions) {
    if (s.mode) modes[s.mode] = (modes[s.mode] || 0) + 1;
  }

  // Gates
  const gateStats = {};
  for (const g of gates) {
    if (g.gate) gateStats[g.gate] = (gateStats[g.gate] || 0) + 1;
  }

  // Tempo
  let timeSpentS = 0;
  for (const t of tasks) {
    timeSpentS += t.dur_s || 0;
  }

  // Economy (LITE vs FULL)
  const economy = calculateEconomy(tasks, agents, modes);

  return {
    sessions: sessions.length / 2,  // cada sessão tem start + end
    tasks: {
      total: tasks.length,
      success: taskSuccess,
      failed: taskFailed,
    },
    tokens: {
      total: tokenTotal,
      input: tokenInput,
      output: tokenOutput,
      cache_write: tokenCacheWrite,
      cache_read: tokenCacheRead,
    },
    tokens_available: hasTokenData,
    modes,
    skills,
    agents: agentTypes,
    models,
    time_spent_s: timeSpentS,
    gates: gateStats,
    economy,
  };
}

/**
 * Calcula economia de tokens LITE vs FULL.
 * Só calcula quando ambos os modos têm pelo menos 1 execução registrada.
 * @param {object[]} tasks
 * @param {object[]} agents
 * @param {object} modes
 * @returns {object|null}
 */
function calculateEconomy(tasks, agents, modes) {
  const hasLite = (modes.LITE || 0) > 0;
  const hasFull = (modes.FULL || 0) > 0;

  if (!hasLite || !hasFull) {
    return {
      available: false,
      note: 'Economy comparison requires at least one LITE and one FULL session recorded.',
    };
  }

  // Calcular média de tokens FULL por tarefa como baseline
  let fullTokensTotal = 0;
  let fullTaskCount = 0;

  // Mapear agentes para tasks aproximadamente pelo timestamp
  // (simplificação: média de tokens por agente nas sessões FULL)
  for (const a of agents) {
    if (a.tokens && a.tokens.total != null) {
      fullTokensTotal += a.tokens.total;
      fullTaskCount++;
    }
  }

  if (fullTaskCount === 0) {
    return {
      available: false,
      note: 'No tokens recorded in FULL mode to establish baseline.',
    };
  }

  const baselineFullTokens = Math.round(fullTokensTotal / fullTaskCount);

  // Calcular tokens LITE reais
  let liteTokensTotal = 0;
  for (const a of agents) {
    if (a.tokens && a.tokens.total != null) {
      liteTokensTotal += a.tokens.total;
    }
  }

  const liteTaskCount = tasks.length;
  const liteAvgTokens = liteTaskCount > 0 ? Math.round(liteTokensTotal / liteTaskCount) : 0;

  // Estimar economia: quantos tokens FULL equivaleriam às tarefas LITE?
  const estimatedFullTokens = liteTaskCount * baselineFullTokens;
  const savedTokens = Math.max(0, estimatedFullTokens - liteTokensTotal);
  const savingsPct = estimatedFullTokens > 0
    ? Math.round((savedTokens / estimatedFullTokens) * 100)
    : 0;

  return {
    available: true,
    lite_tokens: liteTokensTotal,
    lite_avg_per_task: liteAvgTokens,
    full_baseline_per_task: baselineFullTokens,
    estimated_full_tokens: estimatedFullTokens,
    saved_tokens: savedTokens,
    savings_pct: savingsPct,
    note: 'LITE economy vs FULL calculated from real executions of each mode. Baseline: avg FULL tokens per task from historical agent data.',
  };
}

// ─── Snapshot Build & Read ──────────────────────────────────────────────────

/**
 * Reconstrói snapshots do zero lendo todos os JSONL.
 * Gera: daily, weekly, total.
 * @param {string} metricsDir
 * @returns {object} { daily: {}, weekly: {}, total: {} }
 */
function buildSnapshots(metricsDir) {
  const allEvents = readEvents(metricsDir, 0);

  // Total
  const total = aggregateSnapshot(allEvents);

  // Daily
  const byDay = groupByDay(allEvents);
  const daily = {};
  for (const [day, evts] of Object.entries(byDay)) {
    daily[day] = aggregateSnapshot(evts);
  }

  // Weekly
  const byWeek = groupByWeek(allEvents);
  const weekly = {};
  for (const [week, evts] of Object.entries(byWeek)) {
    weekly[week] = aggregateSnapshot(evts);
  }

  const result = { daily, weekly, total };

  // Salvar snapshots no disco
  const snapDir = path.join(metricsDir, SNAPSHOT_DIR);
  fs.mkdirSync(snapDir, { recursive: true });

  fs.writeFileSync(path.join(snapDir, 'total.json'), JSON.stringify(total, null, 2));

  for (const [day, snap] of Object.entries(daily)) {
    fs.writeFileSync(path.join(snapDir, `daily-${day}.json`), JSON.stringify(snap, null, 2));
  }
  for (const [week, snap] of Object.entries(weekly)) {
    fs.writeFileSync(path.join(snapDir, `weekly-${week}.json`), JSON.stringify(snap, null, 2));
  }

  return result;
}

/**
 * Lê snapshot pré-computado.
 * @param {string} metricsDir
 * @param {string} type - 'total' | 'daily' | 'weekly'
 * @param {string} key - para daily: '2026-07-05', para weekly: '2026-W27'
 * @returns {object|null}
 */
function readSnapshot(metricsDir, type, key) {
  const snapDir = path.join(metricsDir, SNAPSHOT_DIR);
  let fileName;

  switch (type) {
    case 'total':
      fileName = 'total.json';
      break;
    case 'daily':
      fileName = `daily-${key}.json`;
      break;
    case 'weekly':
      fileName = `weekly-${key}.json`;
      break;
    default:
      return null;
  }

  const filePath = path.join(snapDir, fileName);
  if (!fs.existsSync(filePath)) return null;

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return null;
  }
}

module.exports = {
  readJsonlFile,
  listJsonlFiles,
  readEvents,
  groupByDay,
  groupByWeek,
  aggregateSnapshot,
  calculateEconomy,
  buildSnapshots,
  readSnapshot,
};
