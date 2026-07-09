/**
 * pricing.js — Tabela de preços + cálculo de custo por modelo
 *
 * Porte adaptado de token-dashboard-core/src/pricing.rs (Rust) para o
 * schema de eventos do spec-driven-agent, que registra tokens como
 * { input, output, cache_write, cache_read } (sem distinguir cache de
 * 5min vs 1h como o Claude Code faz nativamente).
 *
 * Uso:
 *   const pricing = require('./pricing');
 *   pricing.costFor('claude-sonnet-4-5', { input: 1000, output: 500 });
 *   // -> { usd: 0.0105, estimated: false }
 */

'use strict';

// $ por milhão de tokens. Fallback por tier quando o modelo exato não
// está na tabela (ex: modelo novo ainda não catalogado).
const MODELS = {
  'claude-fable-5':    { tier: 'fable',  input: 10.00, output: 50.00, cache_write: 12.50, cache_read: 1.00 },
  'claude-opus-4-8':   { tier: 'opus',   input:  5.00, output: 25.00, cache_write:  6.25, cache_read: 0.50 },
  'claude-opus-4-7':   { tier: 'opus',   input:  5.00, output: 25.00, cache_write:  6.25, cache_read: 0.50 },
  'claude-opus-4-6':   { tier: 'opus',   input:  5.00, output: 25.00, cache_write:  6.25, cache_read: 0.50 },
  'claude-opus-4-5':   { tier: 'opus',   input:  5.00, output: 25.00, cache_write:  6.25, cache_read: 0.50 },
  'claude-opus-4-1':   { tier: 'opus',   input: 15.00, output: 75.00, cache_write: 18.75, cache_read: 1.50 },
  'claude-opus-4':     { tier: 'opus',   input: 15.00, output: 75.00, cache_write: 18.75, cache_read: 1.50 },
  'claude-sonnet-5':   { tier: 'sonnet', input:  3.00, output: 15.00, cache_write:  3.75, cache_read: 0.30 },
  'claude-sonnet-4-6': { tier: 'sonnet', input:  3.00, output: 15.00, cache_write:  3.75, cache_read: 0.30 },
  'claude-sonnet-4-5': { tier: 'sonnet', input:  3.00, output: 15.00, cache_write:  3.75, cache_read: 0.30 },
  'claude-sonnet-4':   { tier: 'sonnet', input:  3.00, output: 15.00, cache_write:  3.75, cache_read: 0.30 },
  'claude-haiku-4-5':  { tier: 'haiku',  input:  1.00, output:  5.00, cache_write:  1.25, cache_read: 0.10 },
};

// Fallback por tier — usado quando o modelo não está em MODELS mas o
// nome contém um dos tiers (ex: "claude-sonnet-9000-preview").
const TIER_FALLBACK = {
  fable:  { input: 10.00, output: 50.00, cache_write: 12.50, cache_read: 1.00 },
  opus:   { input:  5.00, output: 25.00, cache_write:  6.25, cache_read: 0.50 },
  sonnet: { input:  3.00, output: 15.00, cache_write:  3.75, cache_read: 0.30 },
  haiku:  { input:  1.00, output:  5.00, cache_write:  1.25, cache_read: 0.10 },
};

// Peso "sonnet-equivalente" usado para computar consumo de limite de
// plano (ver limits.js) — opus consome ~5x mais da cota que sonnet.
const TIER_WEIGHT = { fable: 10.0, opus: 5.0, sonnet: 1.0, haiku: 0.33 };

// Planos Claude (assinatura) e seus caps estimados de tokens
// "sonnet-equivalentes" nas janelas de 5h e semanal. Anthropic não
// publica esses valores — são estimativas caso o teto do Max real seja
// ~72M/5h e ~180M/semana. Trate como ±30%; ajuste via override se tiver
// dado real do statusbar da Anthropic.
const PLANS = {
  api:     { monthly: 0,   label: 'API (pay-per-token)', limits: { five_hour: null,       weekly: null } },
  pro:     { monthly: 20,  label: 'Pro',                 limits: { five_hour: 36_000_000, weekly: 90_000_000 } },
  max:     { monthly: 100, label: 'Max',                 limits: { five_hour: 72_000_000, weekly: 180_000_000 } },
  'max-20x': { monthly: 200, label: 'Max 20x',           limits: { five_hour: 360_000_000, weekly: 900_000_000 } },
};

function tierFromName(model) {
  const lower = (model || '').toLowerCase();
  return ['fable', 'opus', 'sonnet', 'haiku'].find(t => lower.includes(t)) || null;
}

/**
 * Remove sufixo de data tipo "-20260214" do fim do nome do modelo,
 * para casar apelidos versionados com a entrada base da tabela.
 */
function stripDateSuffix(model) {
  return model.replace(/-\d{8}$/, '');
}

/**
 * Calcula custo em USD para um uso de tokens de um modelo.
 * @param {string} model - nome do modelo (ex: 'claude-sonnet-4-5')
 * @param {{input?:number, output?:number, cache_write?:number, cache_read?:number}} usage
 * @returns {{usd: number|null, estimated: boolean}}
 */
function costFor(model, usage = {}) {
  const u = {
    input: usage.input || 0,
    output: usage.output || 0,
    cache_write: usage.cache_write || 0,
    cache_read: usage.cache_read || 0,
  };

  let rates = MODELS[model] || MODELS[stripDateSuffix(model)];
  let estimated = false;

  if (!rates) {
    const tier = tierFromName(model);
    rates = tier ? TIER_FALLBACK[tier] : null;
    estimated = true;
  }

  if (!rates) {
    return { usd: null, estimated: true };
  }

  const usd =
    (u.input * rates.input) / 1_000_000 +
    (u.output * rates.output) / 1_000_000 +
    (u.cache_write * rates.cache_write) / 1_000_000 +
    (u.cache_read * rates.cache_read) / 1_000_000;

  return { usd: Math.round(usd * 1e6) / 1e6, estimated };
}

/**
 * Peso sonnet-equivalente de um modelo, usado no cálculo de limite.
 * Modelo desconhecido sem tier reconhecível -> peso 1 (neutro).
 */
function tierWeight(model) {
  const tier = tierFromName(model);
  return tier ? TIER_WEIGHT[tier] : 1.0;
}

module.exports = { MODELS, TIER_FALLBACK, TIER_WEIGHT, PLANS, costFor, tierFromName, tierWeight, stripDateSuffix };
