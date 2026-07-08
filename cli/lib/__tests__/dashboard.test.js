/**
 * Unit tests for cli/lib/dashboard.js
 *
 * Tests pure functions (formatDuration) and module output
 * via dashboard subcommands in isolation.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const { dashboard, showSummary, showJson, buildSnapshots, formatDuration } = require('../dashboard');
const events = require('../events');

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

// ─── Sample events for testing ──────────────────────────────────────────────

const SAMPLE_EVENTS = [
  { ts: '2026-07-05T10:00:00Z', event: 'session_start', session_id: 's1', mode: 'FULL' },
  { ts: '2026-07-05T10:00:01Z', event: 'turn', turn: 1, phase: 'design' },
  { ts: '2026-07-05T10:00:02Z', event: 'tool', tool: 'Read', file: 'src/x.js', dur_ms: 45 },
  { ts: '2026-07-05T10:00:03Z', event: 'agent', agent_type: 'Explore', model: 'claude-sonnet-4-5', tokens: { total: 5000, input: 3000, output: 2000 } },
  { ts: '2026-07-05T10:00:04Z', event: 'gate', gate: 'spec', status: 'approved' },
  { ts: '2026-07-05T10:00:05Z', event: 'task', skill: 'implement', spec: 'test-spec', success: true, dur_s: 120 },
  { ts: '2026-07-05T11:00:00Z', event: 'session_end', session_id: 's1' },
];

function setupMetricsDir() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dash-test-'));
  const metricsDir = path.join(tmpDir, '.claude', 'sda', 'metrics');
  fs.mkdirSync(metricsDir, { recursive: true });

  // Write JSONL
  const filePath = path.join(metricsDir, 'events-2026-07-05.jsonl');
  fs.writeFileSync(filePath, SAMPLE_EVENTS.map(e => JSON.stringify(e)).join('\n'));
  return { tmpDir, metricsDir };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

log('\n🧪 Dashboard Module Tests\n', 'cyan');

log('⏱️  formatDuration:', 'cyan');
test('formats seconds', () => {
  assertEqual(formatDuration(45), '45s');
});

test('formats minutes and seconds', () => {
  assertEqual(formatDuration(125), '2m 5s');
});

test('formats hours and minutes', () => {
  assertEqual(formatDuration(3720), '1h 2m');
});

test('formats zero', () => {
  assertEqual(formatDuration(0), '0s');
});

log('\n📦 buildSnapshots:', 'cyan');
test('builds snapshots and writes to disk', () => {
  const { tmpDir, metricsDir } = setupMetricsDir();
  buildSnapshots(metricsDir);

  const snapDir = path.join(metricsDir, 'snapshots');
  assert(fs.existsSync(path.join(snapDir, 'total.json')));
  assert(fs.existsSync(path.join(snapDir, 'daily-2026-07-05.json')));

  const total = JSON.parse(fs.readFileSync(path.join(snapDir, 'total.json'), 'utf8'));
  assertEqual(total.tasks.total, 1);
  assertEqual(total.tasks.success, 1);
  assertEqual(total.tokens_available, true);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

log('\n📄 showSummary output:', 'cyan');
test('showSummary prints summary for existing data', () => {
  const { tmpDir, metricsDir } = setupMetricsDir();
  buildSnapshots(metricsDir);

  // Capture stdout
  const originalLog = console.log;
  let output = '';
  console.log = (msg) => { output += (msg || '') + '\n'; };

  showSummary(metricsDir);

  console.log = originalLog;

  assert(output.includes('Dashboard'), 'Should contain Dashboard title');
  assert(output.includes('Tarefas'), 'Should contain Tasks');
  assert(output.includes('Tokens'), 'Should contain Tokens');
  assert(output.includes('5.000'), 'Should show token count');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('showSummary shows unavailable when no token data', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dash-notoken-'));
  const metricsDir = path.join(tmpDir, '.claude', 'sda', 'metrics');
  fs.mkdirSync(metricsDir, { recursive: true });

  // Events WITHOUT token data (no agent events)
  const noTokenEvents = [
    { ts: '2026-07-05T10:00:00Z', event: 'session_start', session_id: 's1', mode: 'FULL' },
    { ts: '2026-07-05T10:00:05Z', event: 'task', skill: 'implement', spec: 'test-spec', success: true, dur_s: 120 },
    { ts: '2026-07-05T11:00:00Z', event: 'session_end', session_id: 's1' },
  ];
  fs.writeFileSync(path.join(metricsDir, 'events-2026-07-05.jsonl'), noTokenEvents.map(e => JSON.stringify(e)).join('\n'));

  // Build and capture
  buildSnapshots(metricsDir);

  const originalLog = console.log;
  let output = '';
  console.log = (msg) => { output += (msg || '') + '\n'; };

  showSummary(metricsDir);

  console.log = originalLog;

  assert(output.includes('Indispon'), 'Should say Indisponivel');
  assert(output.includes('subagentes'), 'Should explain subagent-only');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('showSummary handles no data gracefully', () => {
  const emptyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dash-empty-'));

  const originalLog = console.log;
  let output = '';
  console.log = (msg) => { output += msg + '\n'; };

  showSummary(emptyDir);

  console.log = originalLog;

  assert(output.includes('Nenhum dado'), 'Should say no metrics');

  fs.rmSync(emptyDir, { recursive: true, force: true });
});

log('\n📄 showJson output:', 'cyan');
test('showJson outputs JSON', () => {
  const { tmpDir, metricsDir } = setupMetricsDir();
  buildSnapshots(metricsDir);

  const originalLog = console.log;
  let output = '';
  console.log = (msg) => { output += msg; };

  showJson(metricsDir);

  console.log = originalLog;

  const parsed = JSON.parse(output);
  assert(parsed.tasks.total === 1);
  assert(parsed.tokens.total === 5000);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

log('\n🧩 dashboard entry point:', 'cyan');
test('dashboard("summary") calls showSummary', () => {
  const { tmpDir, metricsDir } = setupMetricsDir();
  buildSnapshots(metricsDir);

  const originalLog = console.log;
  let output = '';
  console.log = (msg) => { output += (msg || '') + '\n'; };

  // dashboard() expects cwd = project root (tmpDir)
  dashboard('summary', tmpDir);

  console.log = originalLog;

  assert(output.includes('Dashboard'), 'Entry point should produce dashboard output');
  assert(output.includes('Tarefas'), 'Should show task summary');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('dashboard("json") outputs valid JSON', () => {
  const { tmpDir, metricsDir } = setupMetricsDir();
  buildSnapshots(metricsDir);

  const originalLog = console.log;
  let output = '';
  console.log = (msg) => { output += msg; };

  dashboard('json', path.dirname(path.dirname(metricsDir)));

  console.log = originalLog;

  const parsed = JSON.parse(output);
  assert(typeof parsed.tasks === 'object');

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// ─── Summary ────────────────────────────────────────────────────────────────

console.log('');
console.log('='.repeat(50));
log(`\n📊 Dashboard Test Results: ${passed} passed, ${failed} failed\n`, failed === 0 ? 'green' : 'red');
process.exit(failed > 0 ? 1 : 0);
