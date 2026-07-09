/**
 * events.js — Módulo de Eventos (JSONL + Snapshots)
 *
 * Camada de dados do Dashboard de Métricas. Desacoplada do TUI:
 * todas as funções recebem (basedir, ...) e retornam objetos JS puros.
 *
 * Suporta cache incremental: na maioria das chamadas apenas linhas novas
 * dos JSONL são lidas e mescladas no snapshot existente, evitando re-ler
 * todo o histórico. O cache é armazenado em _cache_files (contagem de
 * linhas por arquivo) e _cache_state (estado de mode tracking) dentro de
 * total.json.
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
const pricing = require('./pricing');

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

/**
 * Lê apenas eventos novos desde o último cache, comparando linha a linha
 * por arquivo. Retorna os novos eventos + mapa atualizado de cache.
 * @param {string} metricsDir
 * @param {object} cacheFiles - { 'events-2026-07.jsonl': 150, ... }
 * @returns {{ events: object[], cacheFiles: object, hasNewData: boolean }}
 */
function readEventsSince(metricsDir, cacheFiles) {
  const allFiles = listJsonlFiles(metricsDir);
  const newCacheFiles = { ...(cacheFiles || {}) };
  const allNewEvents = [];
  let hasNewData = false;

  for (const filePath of allFiles) {
    const fileName = path.basename(filePath);
    const cachedLines = newCacheFiles[fileName] || 0;

    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    const totalLines = lines.length;

    newCacheFiles[fileName] = totalLines;

    if (totalLines <= cachedLines) continue;

    hasNewData = true;
    const newLines = lines.slice(cachedLines);
    for (const line of newLines) {
      try {
        allNewEvents.push(JSON.parse(line));
      } catch (_) { /* skip malformed */ }
    }
  }

  // Remove arquivos que foram rotacionados/compactados
  const currentFilenames = new Set(allFiles.map(f => path.basename(f)));
  for (const key of Object.keys(newCacheFiles)) {
    if (!currentFilenames.has(key)) delete newCacheFiles[key];
  }

  return { events: allNewEvents, cacheFiles: newCacheFiles, hasNewData };
}

/**
 * Extrai o cache_state final de um array completo de eventos.
 * Usado na primeira build (sem cache) para inicializar o estado incremental.
 * @param {object[]} events
 * @returns {object}
 */
function extractCacheState(events) {
  const tagged = tagEventsWithMode(events);
  const state = {
    activeMode: 'FULL',
    tokensByMode: { LITE: 0, FULL: 0 },
    agentCountByMode: { LITE: 0, FULL: 0 },
    tasksByMode: { LITE: 0, FULL: 0 },
    openSessionCount: 0,
    completedSessions: 0,
  };
  for (const e of tagged) {
    if (e.event === 'session_start' && e.mode) {
      state.activeMode = e.mode;
    } else if (e.event === 'session_end') {
      state.activeMode = 'FULL';
    }
    if (e.event === 'session_start') {
      state.openSessionCount++;
    } else if (e.event === 'session_end') {
      if (state.openSessionCount > 0) {
        state.openSessionCount--;
        state.completedSessions++;
      }
    }
    if (e.event === 'agent' && e.tokens && e.tokens.total != null) {
      const m = e._mode || 'FULL';
      state.tokensByMode[m] = (state.tokensByMode[m] || 0) + e.tokens.total;
      state.agentCountByMode[m] = (state.agentCountByMode[m] || 0) + 1;
    }
    if (e.event === 'task') {
      const m = e._mode || 'FULL';
      state.tasksByMode[m] = (state.tasksByMode[m] || 0) + 1;
    }
  }
  return state;
}

/**
 * Agrega um lote de eventos delta (novos), partindo de um estado de modo
 * conhecido do cache anterior. Retorna totais parciais para merge.
 * @param {object[]} events - novos eventos (podem estar fora de ordem)
 * @param {object} initialState - { activeMode, tokensByMode, ... }
 * @returns {object}
 */
function aggregateDelta(events, initialState) {
  let activeMode = (initialState && initialState.activeMode) || 'FULL';
  const sorted = [...events].sort((a, b) => (a.ts || '').localeCompare(b.ts || ''));

  const delta = {
    tasks: [],
    taskSuccess: 0,
    taskFailed: 0,
    agents: [],
    tokens: { total: 0, input: 0, output: 0, cache_write: 0, cache_read: 0 },
    hasTokenData: false,
    skills: {},
    agentTypes: {},
    models: {},
    costByModel: {},
    costTotalUsd: 0,
    costHasEstimate: false,
    completedSessions: 0,
    modes: {},
    gates: {},
    timeSpentS: 0,
    tokensByMode: { LITE: 0, FULL: 0 },
    agentCountByMode: { LITE: 0, FULL: 0 },
    tasksByMode: { LITE: 0, FULL: 0 },
    finalActiveMode: 'FULL',
    finalOpenSessionCount: (initialState && initialState.openSessionCount) || 0,
  };

  for (const e of sorted) {
    // Mode tracking
    if (e.event === 'session_start' && e.mode) {
      activeMode = e.mode;
    } else if (e.event === 'session_end') {
      activeMode = 'FULL';
    }
    e._mode = activeMode;

    // Session tracking with carry-over from cache
    if (e.event === 'session_start') {
      delta.finalOpenSessionCount++;
    } else if (e.event === 'session_end') {
      if (delta.finalOpenSessionCount > 0) {
        delta.finalOpenSessionCount--;
        delta.completedSessions++;
      }
    }

    if (e.event === 'task') {
      delta.tasks.push(e);
      if (e.success === true) delta.taskSuccess++;
      if (e.success === false) delta.taskFailed++;
      if (e.skill) delta.skills[e.skill] = (delta.skills[e.skill] || 0) + 1;
      if (e.dur_s) delta.timeSpentS += e.dur_s;
      delta.tasksByMode[activeMode] = (delta.tasksByMode[activeMode] || 0) + 1;
    }

    if (e.event === 'agent') {
      delta.agents.push(e);
      if (e.agent_type) delta.agentTypes[e.agent_type] = (delta.agentTypes[e.agent_type] || 0) + 1;
      if (e.model) delta.models[e.model] = (delta.models[e.model] || 0) + 1;

      if (e.tokens && e.tokens.total != null) {
        delta.tokens.total += e.tokens.total;
        delta.tokens.input += e.tokens.input || 0;
        delta.tokens.output += e.tokens.output || 0;
        delta.tokens.cache_write += e.tokens.cache_write || 0;
        delta.tokens.cache_read += e.tokens.cache_read || 0;
        delta.hasTokenData = true;

        delta.tokensByMode[activeMode] = (delta.tokensByMode[activeMode] || 0) + e.tokens.total;
        delta.agentCountByMode[activeMode] = (delta.agentCountByMode[activeMode] || 0) + 1;
      }

      if (e.model && e.tokens) {
        const { usd, estimated } = pricing.costFor(e.model, {
          input: e.tokens.input,
          output: e.tokens.output,
          cache_write: e.tokens.cache_write,
          cache_read: e.tokens.cache_read,
        });
        if (usd != null) {
          delta.costByModel[e.model] = Math.round(((delta.costByModel[e.model] || 0) + usd) * 1e6) / 1e6;
          delta.costTotalUsd += usd;
          if (estimated) delta.costHasEstimate = true;
        }
      }
    }

    if (e.event === 'session_start') {
      if (e.mode) delta.modes[e.mode] = (delta.modes[e.mode] || 0) + 1;
    }

    if (e.event === 'gate' && e.gate) {
      delta.gates[e.gate] = (delta.gates[e.gate] || 0) + 1;
    }
  }

  delta.finalActiveMode = activeMode;
  delta.costTotalUsd = Math.round(delta.costTotalUsd * 1e6) / 1e6;

  return delta;
}

/**
 * Mescla um delta de novos eventos em um snapshot total existente.
 * Atualiza campos aditivos e recalcula economy.
 * @param {object} snap - snapshot existente (deve ter _cache_files e _cache_state)
 * @param {object} delta - resultado de aggregateDelta()
 * @returns {object} novo snapshot mesclado
 */
function mergeSnapshot(snap, delta) {
  const prev = snap._cache_state || {
    activeMode: 'FULL',
    tokensByMode: { LITE: 0, FULL: 0 },
    agentCountByMode: { LITE: 0, FULL: 0 },
    tasksByMode: { LITE: 0, FULL: 0 },
  };

  // Mesclar campos aditivos
  const merged = {
    ...snap,
    sessions: (snap.sessions || 0) + delta.completedSessions,
    tasks: {
      total: (snap.tasks ? snap.tasks.total : 0) + delta.tasks.length,
      success: (snap.tasks ? snap.tasks.success : 0) + delta.taskSuccess,
      failed: (snap.tasks ? snap.tasks.failed : 0) + delta.taskFailed,
    },
    tokens: {
      total: (snap.tokens ? snap.tokens.total : 0) + delta.tokens.total,
      input: (snap.tokens ? snap.tokens.input : 0) + delta.tokens.input,
      output: (snap.tokens ? snap.tokens.output : 0) + delta.tokens.output,
      cache_write: (snap.tokens ? snap.tokens.cache_write : 0) + delta.tokens.cache_write,
      cache_read: (snap.tokens ? snap.tokens.cache_read : 0) + delta.tokens.cache_read,
    },
    tokens_available: (snap.tokens_available || false) || delta.hasTokenData,
    time_spent_s: (snap.time_spent_s || 0) + delta.timeSpentS,
  };

  // Skills
  merged.skills = { ...(snap.skills || {}) };
  for (const [skill, count] of Object.entries(delta.skills)) {
    merged.skills[skill] = (merged.skills[skill] || 0) + count;
  }

  // Agentes
  merged.agents = { ...(snap.agents || {}) };
  for (const [type, count] of Object.entries(delta.agentTypes)) {
    merged.agents[type] = (merged.agents[type] || 0) + count;
  }

  // Modelos
  merged.models = { ...(snap.models || {}) };
  for (const [model, count] of Object.entries(delta.models)) {
    merged.models[model] = (merged.models[model] || 0) + count;
  }

  // Modos
  merged.modes = { ...(snap.modes || {}) };
  for (const [mode, count] of Object.entries(delta.modes)) {
    merged.modes[mode] = (merged.modes[mode] || 0) + count;
  }

  // Gates
  merged.gates = { ...(snap.gates || {}) };
  for (const [gate, count] of Object.entries(delta.gates)) {
    merged.gates[gate] = (merged.gates[gate] || 0) + count;
  }

  // Custo
  merged.cost = { ...(snap.cost || {}) };
  merged.cost.total_usd = Math.round(((snap.cost ? snap.cost.total_usd : 0) + delta.costTotalUsd) * 1e6) / 1e6;
  merged.cost.by_model = { ...(snap.cost ? snap.cost.by_model : {}) };
  for (const [model, cost] of Object.entries(delta.costByModel)) {
    merged.cost.by_model[model] = Math.round(((merged.cost.by_model[model] || 0) + cost) * 1e6) / 1e6;
  }
  merged.cost.has_estimate = (snap.cost ? snap.cost.has_estimate : false) || delta.costHasEstimate;

  // Recalcular economy do estado mesclado
  const newState = {
    activeMode: delta.finalActiveMode,
    tokensByMode: {
      LITE: (prev.tokensByMode ? prev.tokensByMode.LITE : 0) + (delta.tokensByMode.LITE || 0),
      FULL: (prev.tokensByMode ? prev.tokensByMode.FULL : 0) + (delta.tokensByMode.FULL || 0),
    },
    agentCountByMode: {
      LITE: (prev.agentCountByMode ? prev.agentCountByMode.LITE : 0) + (delta.agentCountByMode.LITE || 0),
      FULL: (prev.agentCountByMode ? prev.agentCountByMode.FULL : 0) + (delta.agentCountByMode.FULL || 0),
    },
    tasksByMode: {
      LITE: (prev.tasksByMode ? prev.tasksByMode.LITE : 0) + (delta.tasksByMode.LITE || 0),
      FULL: (prev.tasksByMode ? prev.tasksByMode.FULL : 0) + (delta.tasksByMode.FULL || 0),
    },
    openSessionCount: delta.finalOpenSessionCount,
    completedSessions: (prev.completedSessions || 0) + delta.completedSessions,
  };

  merged.economy = calculateEconomy(
    newState.tokensByMode,
    newState.agentCountByMode,
    newState.tasksByMode
  );

  merged._cache_state = newState;

  return merged;
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
 * Processa eventos em ordem cronológica, rastreando o modo (LITE/FULL)
 * ativo em cada momento a partir dos eventos session_start/session_end.
 * Retorna evento com campo _mode adicional.
 * @param {object[]} events
 * @returns {object[]} Eventos com _mode
 */
function tagEventsWithMode(events) {
  let activeMode = 'FULL';  // default
  // Garantir ordenação por timestamp
  const sorted = [...events].sort((a, b) => {
    if (!a.ts) return -1;
    if (!b.ts) return 1;
    return a.ts.localeCompare(b.ts);
  });

  return sorted.map(e => {
    if (e.event === 'session_start' && e.mode) {
      activeMode = e.mode;
    } else if (e.event === 'session_end') {
      activeMode = 'FULL';  // reset ao default após sessão
    }
    return { ...e, _mode: activeMode };
  });
}

/**
 * Agrega um conjunto de eventos em um snapshot.
 * Processa eventos em ordem cronológica para rastrear modo LITE/FULL.
 * @param {object[]} rawEvents
 * @returns {object} Snapshot no formato padronizado
 */
function aggregateSnapshot(rawEvents) {
  // Taggear eventos com modo ativo (ordem cronológica)
  const events = tagEventsWithMode(rawEvents);

  const tasks = events.filter(e => e.event === 'task');
  const agents = events.filter(e => e.event === 'agent');
  const tools = events.filter(e => e.event === 'tool');
  const gates = events.filter(e => e.event === 'gate');
  const sessions = events.filter(e => e.event === 'session_start' || e.event === 'session_end');

  // Tasks (totais)
  const taskSuccess = tasks.filter(t => t.success === true).length;
  const taskFailed = tasks.filter(t => t.success === false).length;

  // Tasks por modo
  const tasksByMode = {};
  for (const t of tasks) {
    const mode = t._mode || 'FULL';
    if (!tasksByMode[mode]) tasksByMode[mode] = 0;
    tasksByMode[mode]++;
  }

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

  // Tokens por modo (para economy)
  const tokensByMode = { LITE: 0, FULL: 0 };
  const agentCountByMode = { LITE: 0, FULL: 0 };

  for (const a of agents) {
    if (a.tokens && a.tokens.total != null) {
      tokenTotal += a.tokens.total;
      tokenInput += a.tokens.input || 0;
      tokenOutput += a.tokens.output || 0;
      tokenCacheWrite += a.tokens.cache_write || 0;
      tokenCacheRead += a.tokens.cache_read || 0;
      hasTokenData = true;

      const mode = a._mode || 'FULL';
      tokensByMode[mode] = (tokensByMode[mode] || 0) + a.tokens.total;
      agentCountByMode[mode] = (agentCountByMode[mode] || 0) + 1;
    }
  }

  // Agentes/modelos
  const agentTypes = {};
  const models = {};
  // Custo estimado em USD por modelo (só quando o evento tem tokens e model).
  const costByModel = {};
  let costTotalUsd = 0;
  let costHasEstimate = false;
  for (const a of agents) {
    if (a.agent_type) agentTypes[a.agent_type] = (agentTypes[a.agent_type] || 0) + 1;
    if (a.model) models[a.model] = (models[a.model] || 0) + 1;

    if (a.model && a.tokens) {
      const { usd, estimated } = pricing.costFor(a.model, {
        input: a.tokens.input,
        output: a.tokens.output,
        cache_write: a.tokens.cache_write,
        cache_read: a.tokens.cache_read,
      });
      if (usd != null) {
        costByModel[a.model] = Math.round(((costByModel[a.model] || 0) + usd) * 1e6) / 1e6;
        costTotalUsd += usd;
        if (estimated) costHasEstimate = true;
      }
    }
  }
  costTotalUsd = Math.round(costTotalUsd * 1e6) / 1e6;

  // Modos (contagem de sessões)
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

  // Economy (LITE vs FULL) — com pools separados por modo
  const economy = calculateEconomy(tokensByMode, agentCountByMode, tasksByMode);

  // Sessions: conta pares start+end completos
  let sessionStarts = sessions.filter(e => e.event === 'session_start').length;
  let sessionEnds = sessions.filter(e => e.event === 'session_end').length;
  return {
    sessions: Math.min(sessionStarts, sessionEnds),
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
    cost: {
      total_usd: costTotalUsd,
      by_model: costByModel,
      has_estimate: costHasEstimate, // true se algum $ veio de fallback por tier, não da tabela exata
    },
    time_spent_s: timeSpentS,
    gates: gateStats,
    economy,
  };
}

/**
 * Calcula economia de tokens LITE vs FULL.
 * Processa pools separados por modo (rastreado cronologicamente).
 * Só exibe quando ambos os modos têm pelo menos 1 execução com tokens.
 * @param {object} tokensByMode - { LITE: number, FULL: number }
 * @param {object} agentCountByMode - { LITE: number, FULL: number }
 * @param {object} tasksByMode - { LITE: number, FULL: number }
 * @returns {object}
 */
function calculateEconomy(tokensByMode, agentCountByMode, tasksByMode) {
  const liteTokens = tokensByMode.LITE || 0;
  const fullTokens = tokensByMode.FULL || 0;
  const liteAgentCount = agentCountByMode.LITE || 0;
  const fullAgentCount = agentCountByMode.FULL || 0;
  const liteTaskCount = tasksByMode.LITE || 0;
  const fullTaskCount = tasksByMode.FULL || 0;

  const hasLiteTokens = liteTokens > 0 && liteAgentCount > 0;
  const hasFullTokens = fullTokens > 0 && fullAgentCount > 0;

  if (!hasLiteTokens || !hasFullTokens) {
    const missing = [];
    if (!hasLiteTokens) missing.push('LITE');
    if (!hasFullTokens) missing.push('FULL');
    return {
      available: false,
      note: `No tokens recorded for mode(s): ${missing.join(', ')}. Execute at least one task with tokens in each mode to establish baseline.`,
    };
  }

  // Baseline FULL: média de tokens por chamada de agente em modo FULL
  const fullBaselinePerAgent = Math.round(fullTokens / fullAgentCount);

  // Tokens LITE reais
  const liteAvgPerAgent = Math.round(liteTokens / liteAgentCount);

  // Economia: se as chamadas LITE tivessem custado o baseline FULL
  const estimatedFullTokens = liteAgentCount * fullBaselinePerAgent;
  const savedTokens = Math.max(0, estimatedFullTokens - liteTokens);
  const savingsPct = estimatedFullTokens > 0
    ? Math.round((savedTokens / estimatedFullTokens) * 100)
    : 0;

  return {
    available: true,
    lite_tokens: liteTokens,
    lite_agent_calls: liteAgentCount,
    lite_avg_per_agent: liteAvgPerAgent,
    lite_tasks: liteTaskCount,
    full_tasks: fullTaskCount,
    full_baseline_per_agent: fullBaselinePerAgent,
    full_agent_calls: fullAgentCount,
    estimated_full_tokens: estimatedFullTokens,
    saved_tokens: savedTokens,
    savings_pct: savingsPct,
    note: 'LITE vs FULL calculated from real token data, separated by session mode (chronological tracking). Baseline: avg FULL tokens per agent call.',
  };
}

// ─── Snapshot Build & Read ──────────────────────────────────────────────────

/**
 * Reconstrói snapshots usando cache incremental sempre que possível.
 * Lê apenas linhas novas dos JSONL e mescla no snapshot total existente.
 * Daily/weekly: rebuild total quando há dados novos, leitura de disco quando não.
 * Primeira build (sem cache): full read + full aggregation.
 * @param {string} metricsDir
 * @returns {object} { daily: {}, weekly: {}, total: {} }
 */
function buildSnapshots(metricsDir) {
  const totalSnapPath = path.join(metricsDir, SNAPSHOT_DIR, 'total.json');
  const snapDir = path.join(metricsDir, SNAPSHOT_DIR);

  let cacheFiles = {};
  let oldTotal = null;

  // Tentar ler cache existente
  if (fs.existsSync(totalSnapPath)) {
    try {
      oldTotal = JSON.parse(fs.readFileSync(totalSnapPath, 'utf8'));
      cacheFiles = oldTotal._cache_files || {};
    } catch (_) { /* fall through to full rebuild */ }
  }

  // Ler apenas eventos novos desde o último cache
  const { events: newEvents, cacheFiles: newCacheFiles, hasNewData } = readEventsSince(metricsDir, cacheFiles);

  // ─── Total ──────────────────────────────────────────────────────────────────
  let total;

  if (oldTotal && oldTotal._cache_state && !hasNewData) {
    // Fast path: nada mudou, usar cache
    total = oldTotal;
    total._cache_files = newCacheFiles; // atualiza rotação/compaction
  } else if (oldTotal && oldTotal._cache_state && hasNewData) {
    // Incremental: mesclar novos eventos no snapshot existente
    const delta = aggregateDelta(newEvents, oldTotal._cache_state);
    total = mergeSnapshot(oldTotal, delta);
    total._cache_files = newCacheFiles;
  } else {
    // Full rebuild (sem cache ou cache corrompido)
    const allEvents = readEvents(metricsDir, 0);
    total = aggregateSnapshot(allEvents);
    total._cache_files = newCacheFiles;
    total._cache_state = extractCacheState(allEvents);
  }

  // ─── Daily + Weekly ─────────────────────────────────────────────────────────
  let daily, weekly;

  if (!hasNewData && oldTotal) {
    // Fast path: ler snapshots diários/semanais do disco
    daily = readDailySnapshots(snapDir);
    weekly = readWeeklySnapshots(snapDir);
  } else {
    // Rebuild: ler eventos completos e reagrupar
    const allEvents = readEvents(metricsDir, 0);

    const byDay = groupByDay(allEvents);
    daily = {};
    for (const [day, evts] of Object.entries(byDay)) {
      daily[day] = aggregateSnapshot(evts);
    }

    const byWeek = groupByWeek(allEvents);
    weekly = {};
    for (const [week, evts] of Object.entries(byWeek)) {
      weekly[week] = aggregateSnapshot(evts);
    }
  }

  const result = { daily, weekly, total };

  // Salvar snapshots no disco
  fs.mkdirSync(snapDir, { recursive: true });
  fs.writeFileSync(totalSnapPath, JSON.stringify(total, null, 2));

  for (const [day, snap] of Object.entries(daily)) {
    fs.writeFileSync(path.join(snapDir, `daily-${day}.json`), JSON.stringify(snap, null, 2));
  }
  for (const [week, snap] of Object.entries(weekly)) {
    fs.writeFileSync(path.join(snapDir, `weekly-${week}.json`), JSON.stringify(snap, null, 2));
  }

  return result;
}

/**
 * Lê snapshots diários do disco.
 * @param {string} snapDir
 * @returns {object}
 */
function readDailySnapshots(snapDir) {
  const daily = {};
  if (!fs.existsSync(snapDir)) return daily;
  const files = fs.readdirSync(snapDir).filter(f => f.startsWith('daily-') && f.endsWith('.json'));
  for (const f of files) {
    try {
      const day = f.slice(6, -5); // 'daily-2026-07-05.json' → '2026-07-05'
      daily[day] = JSON.parse(fs.readFileSync(path.join(snapDir, f), 'utf8'));
    } catch (_) { /* skip corrupt */ }
  }
  return daily;
}

/**
 * Lê snapshots semanais do disco.
 * @param {string} snapDir
 * @returns {object}
 */
function readWeeklySnapshots(snapDir) {
  const weekly = {};
  if (!fs.existsSync(snapDir)) return weekly;
  const files = fs.readdirSync(snapDir).filter(f => f.startsWith('weekly-') && f.endsWith('.json'));
  for (const f of files) {
    try {
      const week = f.slice(7, -5); // 'weekly-2026-W27.json' → '2026-W27'
      weekly[week] = JSON.parse(fs.readFileSync(path.join(snapDir, f), 'utf8'));
    } catch (_) { /* skip corrupt */ }
  }
  return weekly;
}

/**
 * Verifica se snapshot total precisa ser reconstruído.
 * Retorna true se snapshot está atualizado em relação aos JSONL.
 * @param {string} metricsDir
 * @returns {boolean}
 */
function isSnapshotFresh(metricsDir) {
  const snapPath = path.join(metricsDir, SNAPSHOT_DIR, 'total.json');
  if (!fs.existsSync(snapPath)) return false;

  const jsonlFiles = listJsonlFiles(metricsDir);
  if (jsonlFiles.length === 0) return true; // sem eventos, snapshot vazio é válido

  try {
    const snapMtime = fs.statSync(snapPath).mtimeMs;
    for (const jf of jsonlFiles) {
      if (fs.statSync(jf).mtimeMs > snapMtime) {
        return false; // JSONL mais novo que snapshot -> stale
      }
    }
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Lê snapshot pré-computado.
 * Para 'total', verifica se há eventos mais recentes e retorna null se stale.
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

  // Freshness check: se JSONL mais novo, snapshot está obsoleto
  if (type === 'total' && !isSnapshotFresh(metricsDir)) {
    return null; // stale — caller deve rebuildar
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return null;
  }
}

/**
 * Indica se o snapshot tem QUALQUER dado útil pra exibir — não só tasks
 * concluídas. `tasks` só populam ao final de uma tarefa (post-task.js);
 * `agents`/`tokens`/`sessions` já existem durante a sessão. Usar apenas
 * `tasks.total` como gate de "vazio" esconde tokens/agentes/custo reais
 * enquanto a primeira tarefa ainda não terminou.
 * @param {object|null} snap
 * @returns {boolean}
 */
function hasData(snap) {
  if (!snap) return false;
  return (
    (snap.tasks?.total || 0) > 0 ||
    (snap.sessions || 0) > 0 ||
    Object.keys(snap.agents || {}).length > 0 ||
    Object.keys(snap.models || {}).length > 0 ||
    (snap.tokens?.total || 0) > 0
  );
}

/**
 * Sanitiza snapshot para consumo externo: remove campos internos de cache
 * que vazam implementação para o usuário final.
 * @param {object} snap
 * @returns {object}
 */
function toPublicSnapshot(snap) {
  if (!snap) return snap;
  const pub = { ...snap };
  delete pub._cache_files;
  delete pub._cache_state;
  return pub;
}

module.exports = {
  readJsonlFile,
  listJsonlFiles,
  readEvents,
  readEventsSince,
  extractCacheState,
  aggregateDelta,
  mergeSnapshot,
  groupByDay,
  groupByWeek,
  aggregateSnapshot,
  calculateEconomy,
  buildSnapshots,
  readSnapshot,
  isSnapshotFresh,
  hasData,
  toPublicSnapshot,
};
