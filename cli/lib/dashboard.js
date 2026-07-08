/**
 * dashboard.js — Módulo do Dashboard
 *
 * Fornece funções para exibir o dashboard no terminal (TUI live + summary).
 * Desacoplado da camada de dados (events.js).
 *
 * Subcomandos:
 *   live      → TUI com readline, polling state.json + snapshots
 *   summary   → Resumo texto agregado (stdout)
 *   json      → JSON puro (pipe-friendly)
 *   build     → Reconstruir snapshots
 */

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const events = require('./events');

const colors = {
  reset: '\x1b[0m', bright: '\x1b[1m',
  red: '\x1b[31m',  green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', cyan:  '\x1b[36m', white:  '\x1b[37m',
};

function colorize(text, color) {
  return `${colors[color] || colors.reset}${text}${colors.reset}`;
}

// ─── State JSON reading ─────────────────────────────────────────────────────

function readState(statePath) {
  if (!fs.existsSync(statePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch (_) {
    return null;
  }
}

function getMetricsDir(cwd) {
  return path.join(cwd, '.claude', 'sda', 'metrics');
}

// ─── Summary Output ─────────────────────────────────────────────────────────

/**
 * Exibe resumo agregado no terminal (texto).
 * @param {string} metricsDir
 * @param {number} days
 */
function showSummary(metricsDir, days = 0) {
  // Tenta ler snapshot total primeiro (mais rápido)
  let snap = events.readSnapshot(metricsDir, 'total');

  // Se não existe snapshot, constrói
  if (!snap) {
    const built = events.buildSnapshots(metricsDir);
    snap = built.total;
  }

  if (!events.hasData(snap)) {
    console.log(colorize('\n📊 Nenhum dado de métricas ainda', 'yellow'));
    console.log(colorize('ℹ️  Metrics appear after the first task completes.', 'cyan'));
    console.log('');
    return;
  }

  const dayLabel = days > 0 ? ` (últimos ${days} dias)` : '';

  console.log(colorize(`\n📊 Dashboard de Métricas${dayLabel}`, 'bright'));
  console.log(colorize('━'.repeat(50), 'cyan'));
  console.log('');

  // Resumo
  console.log(colorize('📋 Resumo:', 'cyan'));
  console.log(colorize(`  Sessões          : ${snap.sessions}`, 'white'));
  console.log(colorize(`  Tarefas          : ${snap.tasks.total} (${snap.tasks.success} sucesso, ${snap.tasks.failed} falha)`, 'white'));
  console.log(colorize(`  Tempo total      : ${formatDuration(snap.time_spent_s)}`, 'white'));
  console.log('');

  // Tokens
  console.log(colorize('🪙 Tokens:', 'cyan'));
  if (snap.tokens_available) {
    console.log(colorize(`  Total            : ${snap.tokens.total.toLocaleString('pt-BR')}`, 'white'));
    console.log(colorize(`  Input            : ${snap.tokens.input.toLocaleString('pt-BR')}`, 'white'));
    console.log(colorize(`  Output           : ${snap.tokens.output.toLocaleString('pt-BR')}`, 'white'));
    if (snap.tokens.cache_write > 0) console.log(colorize(`  Cache write      : ${snap.tokens.cache_write.toLocaleString('pt-BR')}`, 'white'));
    if (snap.tokens.cache_read > 0)  console.log(colorize(`  Cache read       : ${snap.tokens.cache_read.toLocaleString('pt-BR')}`, 'white'));
    if (snap.cost && snap.cost.total_usd > 0) {
      const tilde = snap.cost.has_estimate ? '~' : '';
      console.log(colorize(`  Custo estimado   : ${tilde}$${snap.cost.total_usd.toFixed(4)}`, 'yellow'));
    }
  } else {
    console.log(colorize(`  Indisponível     : Dados de token só estão disponíveis`, 'yellow'));
    console.log(colorize(`                     para chamadas de subagentes (Agent tool).`, 'yellow'));
    console.log(colorize(`                     Ferramentas comuns não expõem token count.`, 'yellow'));
  }
  console.log('');

    // Economia LITE vs FULL
  if (snap.economy && snap.economy.available) {
    console.log(colorize('💰 Economia (LITE vs FULL):', 'cyan'));
    console.log(colorize(`  Tokens LITE         : ${snap.economy.lite_tokens.toLocaleString('pt-BR')} (${snap.economy.lite_agent_calls} chamadas de agente)`, 'white'));
    console.log(colorize(`  Baseline FULL/agent : ${snap.economy.full_baseline_per_agent.toLocaleString('pt-BR')}`, 'white'));
    console.log(colorize(`  Estimado se FULL    : ${snap.economy.estimated_full_tokens.toLocaleString('pt-BR')}`, 'white'));
    console.log(colorize(`  Economia            : ${snap.economy.saved_tokens.toLocaleString('pt-BR')} tokens (${snap.economy.savings_pct}%)`, 'green'));
    console.log(colorize(`  ${snap.economy.note}`, 'cyan'));
  } else {
    console.log(colorize('💰 Economia (LITE vs FULL):', 'cyan'));
    console.log(colorize(`  ${snap.economy ? snap.economy.note : 'N/A'}`, 'yellow'));
    console.log(colorize(`  Execute tarefas em ambos os modos para gerar baseline.`, 'cyan'));
  }
  console.log('');

  // Skills
  if (Object.keys(snap.skills).length > 0) {
    console.log(colorize('🛠️  Skills:', 'cyan'));
    const sorted = Object.entries(snap.skills).sort(([,a], [,b]) => b - a).slice(0, 8);
    for (const [skill, count] of sorted) {
      const bar = '█'.repeat(Math.min(count, 20));
      console.log(colorize(`  ${skill.padEnd(16)} ${bar} (${count})`, 'white'));
    }
    console.log('');
  }

  // Agentes / Modelos
  if (Object.keys(snap.agents).length > 0) {
    console.log(colorize('🤖 Agentes:', 'cyan'));
    for (const [agent, count] of Object.entries(snap.agents)) {
      console.log(colorize(`  ${agent.padEnd(16)} ${count} chamada(s)`, 'white'));
    }
    console.log('');
  }

  // GATES
  if (Object.keys(snap.gates).length > 0) {
    console.log(colorize('🔒 GATES aprovados:', 'cyan'));
    for (const [gate, count] of Object.entries(snap.gates)) {
      console.log(colorize(`  ${gate.padEnd(10)} ${count}x`, 'white'));
    }
    console.log('');
  }

  console.log(colorize('Dados coletados via hooks → JSONL → snapshots', 'cyan'));
  console.log('');
}

/**
 * Exibe saída JSON pura.
 * @param {string} metricsDir
 * @param {number} days
 */
function showJson(metricsDir, days = 0) {
  let snap = events.readSnapshot(metricsDir, 'total');
  if (!snap) {
    const built = events.buildSnapshots(metricsDir);
    snap = built.total;
  }
  console.log(JSON.stringify(snap || { empty: true }, null, 2));
}

/**
 * Reconstrói snapshots do zero.
 * @param {string} metricsDir
 */
function buildSnapshots(metricsDir) {
  if (!fs.existsSync(metricsDir)) {
    console.log(colorize('📁 Diretório de métricas não encontrado. Execute algumas tarefas primeiro.', 'yellow'));
    return;
  }
  const result = events.buildSnapshots(metricsDir);
  const days = Object.keys(result.daily).length;
  const weeks = Object.keys(result.weekly).length;
  console.log(colorize(`✅ Snapshots rebuilt: ${days} days, ${weeks} weeks, 1 total`, 'green'));
  console.log(colorize(`📁 ${path.join(metricsDir, 'snapshots')}`, 'cyan'));
}

/**
 * TUI live com readline — mostra estado da sessão atual com polling.
 * @param {string} metricsDir
 * @param {string} statePath
 */
function showLive(metricsDir, statePath) {
  console.log(colorize('\n📊 Dashboard — Live Mode', 'bright'));
  console.log(colorize('  Pressione Ctrl+C para sair', 'cyan'));
  console.log('');

  function renderLive() {
    const state = readState(statePath);
    let snap = events.readSnapshot(metricsDir, 'total');

    // Se snapshot está stale (JSONL mais novo), reconstrói
    if (!snap && fs.existsSync(path.join(metricsDir, 'snapshots', 'total.json'))) {
      const built = events.buildSnapshots(metricsDir);
      snap = built.total;
    }

    // Limpa terminal
    readline.cursorTo(process.stdout, 0, 3);
    readline.clearScreenDown(process.stdout);

    if (!state) {
      console.log(colorize('⏳ No active session. Waiting...', 'yellow'));
      return;
    }

    // Topo — sessão atual
    const phase = state.phase || '—';
    const turn = state.turns?.current || 0;
    const maxTurns = state.turns?.max || 40;
    const spec = state.active_spec || 'none';
    const pct = maxTurns > 0 ? Math.round((turn / maxTurns) * 100) : 0;

    console.log(colorize('🔴 SESSÃO ATIVA', 'bright'));
    console.log(colorize(`  Fase    : ${phase}`, 'white'));
    console.log(colorize(`  Spec    : ${spec}`, 'white'));
    console.log(colorize(`  Turn    : ${turn}/${maxTurns} (${pct}%)`, 'white'));
    console.log(colorize(`  GATEs   : spec=${state.gates?.spec || '—'}  design=${state.gates?.design || '—'}  plan=${state.gates?.plan || '—'}`, 'white'));
    console.log('');

    // Abaixo — histórico
    if (events.hasData(snap)) {
      console.log(colorize('📋 Histórico:', 'cyan'));
      console.log(colorize(`  Tarefas : ${snap.tasks.total} (${snap.tasks.success} ✅ / ${snap.tasks.failed} ❌)`, 'white'));
      console.log(colorize(`  Tempo   : ${formatDuration(snap.time_spent_s)}`, 'white'));

      if (snap.tokens_available) {
        console.log(colorize(`  Tokens  : ${snap.tokens.total.toLocaleString('pt-BR')} total`, 'white'));
      } else {
        console.log(colorize(`  Tokens  : indisponível (apenas subagentes)`, 'yellow'));
      }

      if (snap.economy?.available) {
        console.log(colorize(`  Economia: ${snap.economy.saved_tokens.toLocaleString('pt-BR')} tokens (${snap.economy.savings_pct}%)`, 'green'));
      }
    } else {
      console.log(colorize('📋 Histórico: aguardando primeira tarefa...', 'yellow'));
    }
  }

  // Primeiro render imediato (sem delay de 1s)
  renderLive();

  // Polling a cada 1s
  let interval = setInterval(renderLive, 1000);

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log(colorize('\n\n✅ Dashboard encerrado.', 'green'));
    process.exit(0);
  });
}

// ─── Utilitários ────────────────────────────────────────────────────────────

function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

// ─── Main ───────────────────────────────────────────────────────────────────

function dashboard(subcommand, cwd, days = 0) {
  const metricsDir = getMetricsDir(cwd);
  const statePath = path.join(cwd, '.claude', 'sda', 'hooks', 'state.json');

  switch (subcommand) {
    case 'live':
      showLive(metricsDir, statePath);
      break;
    case 'summary':
    case undefined:
    case null:
      showSummary(metricsDir, days);
      break;
    case 'json':
      showJson(metricsDir, days);
      break;
    case 'build':
      buildSnapshots(metricsDir);
      break;
    default:
      console.log(colorize(`Unknown subcommand: ${subcommand}`, 'red'));
      console.log(colorize('Usage: sda dashboard [live|summary|json|build] [--days N]', 'cyan'));
  }
}

module.exports = { dashboard, showSummary, showJson, buildSnapshots, showLive, formatDuration };
