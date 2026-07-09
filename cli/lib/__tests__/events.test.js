/**
 * Unit tests for cli/lib/events.js
 *
 * Tests pure functions in isolation (no subprocess, no file IO).
 * Snapshot build test uses a temp directory.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const events = require('../events');

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

let passed = 0;
let failed = 0;

function log(message, color) {
  console.log(`${colors[color] || colors.reset}${message}${colors.reset}`);
}

function test(name, fn) {
  try {
    fn();
    log(`  ✅ ${name}`, 'green');
    passed++;
  } catch (error) {
    log(`  ❌ ${name}: ${error.message}`, 'red');
    failed++;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(msg || `Expected "${JSON.stringify(expected)}", got "${JSON.stringify(actual)}"`);
  }
}

// ─── Sample events ──────────────────────────────────────────────────────────

const SAMPLE_EVENTS = [
  { ts: '2026-07-05T10:00:00Z', event: 'session_start', session_id: 's1', mode: 'FULL' },
  { ts: '2026-07-05T10:01:00Z', event: 'turn', turn: 1, phase: 'design' },
  { ts: '2026-07-05T10:02:00Z', event: 'tool', tool: 'Read', file: 'src/x.js', dur_ms: 45 },
  { ts: '2026-07-05T10:03:00Z', event: 'agent', agent_type: 'Explore', model: 'claude-sonnet-4-5', tokens: { total: 5000, input: 3000, output: 2000 } },
  { ts: '2026-07-05T10:04:00Z', event: 'gate', gate: 'spec', status: 'approved' },
  { ts: '2026-07-05T10:05:00Z', event: 'task', skill: 'implement', spec: 'test-spec', success: true, dur_s: 120 },
  { ts: '2026-07-05T11:00:00Z', event: 'session_end', session_id: 's1' },
  { ts: '2026-07-06T10:00:00Z', event: 'session_start', session_id: 's2', mode: 'LITE' },
  { ts: '2026-07-06T10:30:00Z', event: 'task', skill: 'fix', spec: 'bug-fix', success: true, dur_s: 60 },
  { ts: '2026-07-06T11:00:00Z', event: 'agent', agent_type: 'general', model: 'claude-sonnet-4-5', tokens: null },
  { ts: '2026-07-06T12:00:00Z', event: 'session_end', session_id: 's2' },
];

// ─── Tests ──────────────────────────────────────────────────────────────────

log('\n🧪 Events Module Tests\n', 'cyan');

log('📁 readJsonlFile:', 'cyan');
test('parses valid JSONL', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'events-test-'));
  const filePath = path.join(tmpDir, 'events-2026-07-05.jsonl');
  fs.writeFileSync(filePath, SAMPLE_EVENTS.slice(0, 3).map(e => JSON.stringify(e)).join('\n'));
  const result = events.readJsonlFile(filePath);
  assertEqual(result.length, 3);
  assertEqual(result[0].event, 'session_start');
  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('returns empty for missing file', () => {
  const result = events.readJsonlFile('/nonexistent/file.jsonl');
  assertEqual(result.length, 0);
});

test('returns empty for empty file', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'events-test-'));
  const filePath = path.join(tmpDir, 'empty.jsonl');
  fs.writeFileSync(filePath, '');
  const result = events.readJsonlFile(filePath);
  assertEqual(result.length, 0);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('skips malformed lines', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'events-test-'));
  const filePath = path.join(tmpDir, 'bad.jsonl');
  fs.writeFileSync(filePath, '{"valid": true}\nnot json\n{"also": "valid"}');
  const result = events.readJsonlFile(filePath);
  assertEqual(result.length, 2);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

log('\n📁 listJsonlFiles:', 'cyan');
test('finds only events-*.jsonl files', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'events-test-'));
  fs.writeFileSync(path.join(tmpDir, 'events-2026-07-05.jsonl'), '{}');
  fs.writeFileSync(path.join(tmpDir, 'events-2026-07-06.jsonl'), '{}');
  fs.writeFileSync(path.join(tmpDir, 'other.txt'), '{}');
  const result = events.listJsonlFiles(tmpDir);
  assertEqual(result.length, 2);
  assert(result[0].includes('events-2026-07-05'));
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('returns empty for missing dir', () => {
  const result = events.listJsonlFiles('/nonexistent');
  assertEqual(result.length, 0);
});

log('\n📁 groupByDay:', 'cyan');
test('groups events by day', () => {
  const groups = events.groupByDay(SAMPLE_EVENTS);
  const days = Object.keys(groups).sort();
  assertEqual(days.length, 2);
  assertEqual(days[0], '2026-07-05');
  assertEqual(days[1], '2026-07-06');
  assertEqual(groups['2026-07-05'].length, 7);
  assertEqual(groups['2026-07-06'].length, 4);
});

log('\n📁 aggregateSnapshot:', 'cyan');
test('aggregates tasks correctly', () => {
  const snap = events.aggregateSnapshot(SAMPLE_EVENTS);
  assertEqual(snap.tasks.total, 2);
  assertEqual(snap.tasks.success, 2);
  assertEqual(snap.tasks.failed, 0);
});

test('aggregates tokens when available', () => {
  const snap = events.aggregateSnapshot(SAMPLE_EVENTS);
  assert(snap.tokens_available, 'Should have token data');
  assertEqual(snap.tokens.total, 5000);
  assertEqual(snap.tokens.input, 3000);
  assertEqual(snap.tokens.output, 2000);
});

test('aggregates skills', () => {
  const snap = events.aggregateSnapshot(SAMPLE_EVENTS);
  assertEqual(snap.skills['implement'], 1);
  assertEqual(snap.skills['fix'], 1);
});

test('aggregates agents', () => {
  const snap = events.aggregateSnapshot(SAMPLE_EVENTS);
  assertEqual(snap.agents['Explore'], 1);
  assertEqual(snap.agents['general'], 1);
});

test('aggregates modes', () => {
  const snap = events.aggregateSnapshot(SAMPLE_EVENTS);
  assertEqual(snap.modes['FULL'], 1);
  assertEqual(snap.modes['LITE'], 1);
});

log('\n📁 calculateEconomy:', 'cyan');
test('returns not available when only one mode present', () => {
  const result = events.calculateEconomy(
    { FULL: 100 },   // tokensByMode
    { FULL: 1 },     // agentCountByMode
    { FULL: 1 }      // tasksByMode
  );
  assertEqual(result.available, false);
  assert(result.note.includes('LITE'));
});

test('calculates economy with both modes', () => {
  const result = events.calculateEconomy(
    { LITE: 50, FULL: 200 },  // tokensByMode
    { LITE: 2, FULL: 2 },     // agentCountByMode
    { LITE: 1, FULL: 1 }      // tasksByMode
  );
  assert(result.available);
  assert(result.saved_tokens > 0);
  assert(result.full_baseline_per_agent === 100);  // 200 / 2
  assert(result.lite_avg_per_agent === 25);         // 50 / 2
});

log('\n📁 buildSnapshots + readSnapshot:', 'cyan');
test('builds and reads snapshots from JSONL files', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'events-test-'));
  // Write JSONL
  const filePath = path.join(tmpDir, 'events-2026-07-05.jsonl');
  fs.writeFileSync(filePath, SAMPLE_EVENTS.map(e => JSON.stringify(e)).join('\n'));

  // Build
  const snapshots = events.buildSnapshots(tmpDir);
  assert(snapshots.total.tasks.total === 2);
  assert(snapshots.daily['2026-07-05'].tasks.total === 1);  // only 1 task on day 1

  // Read total snapshot
  const total = events.readSnapshot(tmpDir, 'total');
  assert(total !== null);
  assertEqual(total.tasks.total, 2);

  // Read daily snapshot (only 1 task on 2026-07-05)
  const daily = events.readSnapshot(tmpDir, 'daily', '2026-07-05');
  assert(daily !== null);
  assertEqual(daily.tasks.total, 1);

  // Read non-existent snapshot
  const missing = events.readSnapshot(tmpDir, 'daily', '2099-01-01');
  assert(missing === null);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

log('\n📁 incremental cache equivalence:', 'cyan');
test('incremental merge equals full aggregate', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'events-incr-'));
  const filePath = path.join(tmpDir, 'events-2026-07.jsonl');

  // Batch 1: primeiros 6 eventos (apenas 1 task, 1 agent com tokens)
  const batch1 = SAMPLE_EVENTS.slice(0, 6);
  fs.writeFileSync(filePath, batch1.map(e => JSON.stringify(e)).join('\n'));

  // Build inicial: cria cache incremental
  const snap1 = events.buildSnapshots(tmpDir);
  assert(snap1.total._cache_files, 'should have _cache_files after build');
  assert(snap1.total._cache_state, 'should have _cache_state after build');
  assertEqual(snap1.total.tasks.total, 1, 'batch 1 should have 1 task');

  // Batch 2: append demais eventos (5 restantes)
  const batch2 = SAMPLE_EVENTS.slice(6);
  const existing = fs.readFileSync(filePath, 'utf8').trim();
  fs.writeFileSync(filePath, existing + '\n' + batch2.map(e => JSON.stringify(e)).join('\n'));

  // Baseline: full aggregation de TODOS os eventos
  const allEvents = events.readEvents(tmpDir, 0);
  const fullBaseline = events.aggregateSnapshot(allEvents);

  // Caminho incremental: readEventsSince -> aggregateDelta -> mergeSnapshot
  const readResult = events.readEventsSince(tmpDir, snap1.total._cache_files);
  assert(readResult.hasNewData, 'should detect new data');
  assertEqual(readResult.events.length, 5, 'should read 5 new events');

  const delta = events.aggregateDelta(readResult.events, snap1.total._cache_state);
  const merged = events.mergeSnapshot(snap1.total, delta);
  merged._cache_files = readResult.cacheFiles;

  // Equivalencia: merged deve ser IDENTICO ao full baseline
  assertEqual(merged.tasks.total, fullBaseline.tasks.total, 'tasks.total');
  assertEqual(merged.tasks.success, fullBaseline.tasks.success, 'tasks.success');
  assertEqual(merged.tasks.failed, fullBaseline.tasks.failed, 'tasks.failed');
  assertEqual(merged.tokens.total, fullBaseline.tokens.total, 'tokens.total');
  assertEqual(merged.tokens.input, fullBaseline.tokens.input, 'tokens.input');
  assertEqual(merged.tokens.output, fullBaseline.tokens.output, 'tokens.output');
  assertEqual(merged.tokens.cache_write, fullBaseline.tokens.cache_write, 'tokens.cache_write');
  assertEqual(merged.tokens.cache_read, fullBaseline.tokens.cache_read, 'tokens.cache_read');
  assertEqual(merged.sessions, fullBaseline.sessions, 'sessions');
  assertEqual(merged.time_spent_s, fullBaseline.time_spent_s, 'time_spent_s');
  assertEqual(JSON.stringify(merged.skills), JSON.stringify(fullBaseline.skills), 'skills');
  assertEqual(JSON.stringify(merged.agents), JSON.stringify(fullBaseline.agents), 'agents');
  assertEqual(JSON.stringify(merged.models), JSON.stringify(fullBaseline.models), 'models');
  assertEqual(JSON.stringify(merged.modes), JSON.stringify(fullBaseline.modes), 'modes');
  assertEqual(JSON.stringify(merged.gates), JSON.stringify(fullBaseline.gates), 'gates');
  assertEqual(merged.tokens_available, fullBaseline.tokens_available, 'tokens_available');
  assertEqual(merged.cost.total_usd, fullBaseline.cost.total_usd, 'cost.total_usd');
  assertEqual(merged.economy.available, fullBaseline.economy.available, 'economy.available');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('fast path returns cached total when no new data', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'events-fast-'));
  const filePath = path.join(tmpDir, 'events-2026-07.jsonl');
  fs.writeFileSync(filePath, SAMPLE_EVENTS.map(e => JSON.stringify(e)).join('\n'));

  // Primeira build: cria cache
  const snap1 = events.buildSnapshots(tmpDir);
  assert(snap1.total._cache_files, 'first build should have _cache_files');
  assertEqual(snap1.total.tasks.total, 2);

  // Segunda build: sem dados novos -> fast path
  const snap2 = events.buildSnapshots(tmpDir);
  assertEqual(snap2.total.tasks.total, snap1.total.tasks.total, 'fast path should match');
  assert(snap2.total._cache_files, 'fast path should preserve _cache_files');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('full rebuild on missing cache', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'events-nocache-'));
  const filePath = path.join(tmpDir, 'events-2026-07.jsonl');
  fs.writeFileSync(filePath, SAMPLE_EVENTS.map(e => JSON.stringify(e)).join('\n'));

  // Criar diretorio de snapshots com total.json corrompido (sem _cache_state)
  const snapDir = path.join(tmpDir, 'snapshots');
  fs.mkdirSync(snapDir, { recursive: true });
  fs.writeFileSync(path.join(snapDir, 'total.json'), JSON.stringify({ tasks: { total: 0 } }));

  // buildSnapshots deve detectar falta de _cache_state e fazer full rebuild
  const snap = events.buildSnapshots(tmpDir);
  assertEqual(snap.total.tasks.total, 2, 'full rebuild should have correct count');
  assert(snap.total._cache_state, 'full rebuild should have _cache_state');
  assert(snap.total._cache_files, 'full rebuild should have _cache_files');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ─── Summary ────────────────────────────────────────────────────────────────

console.log('');
console.log('='.repeat(50));
log(`\n📊 Events Test Results: ${passed} passed, ${failed} failed\n`, failed === 0 ? 'green' : 'red');
process.exit(failed > 0 ? 1 : 0);
