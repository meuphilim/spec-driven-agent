/**
 * Unit tests for spec-driven-agent shared modules
 *
 * Tests pure functions in isolation (no subprocess, no file IO).
 */

'use strict';

const { sanitizePath } = require('./lib/sanitize');

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function test(name, fn) {
  try {
    fn();
    log(`  ✅ ${name}`, 'green');
    return true;
  } catch (error) {
    log(`  ❌ ${name}: ${error.message}`, 'red');
    return false;
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(msg || `Expected "${expected}", got "${actual}"`);
  }
}

function assertThrows(fn, expectedMsg) {
  try {
    fn();
    throw new Error('Expected error but none was thrown');
  } catch (e) {
    if (expectedMsg && !e.message.includes(expectedMsg)) {
      throw new Error(`Expected error containing "${expectedMsg}", got "${e.message}"`);
    }
    // Expected — error was thrown
  }
}

// ─── Run Tests ──────────────────────────────────────────────────────────────

log('\n🧪 Unit Tests — sanitizePath\n', 'cyan');

let passed = 0;
let failed = 0;

log('📁 Edge cases:', 'cyan');
if (test('null returns null', () => {
  assertEqual(sanitizePath(null), null);
})) passed++; else failed++;

if (test('undefined returns undefined', () => {
  assertEqual(sanitizePath(undefined), undefined);
})) passed++; else failed++;

if (test('empty string returns empty string', () => {
  assertEqual(sanitizePath(''), '');
})) passed++; else failed++;

log('\n🔤 Normal paths:', 'cyan');
if (test('simple relative path', () => {
  const result = sanitizePath('my-project');
  assert(result.endsWith('my-project'), `Expected endsWith my-project, got ${result}`);
})) passed++; else failed++;

if (test('path with dots', () => {
  const result = sanitizePath('my.project.v2');
  assert(result.endsWith('my.project.v2'));
})) passed++; else failed++;

if (test('path with hyphens', () => {
  const result = sanitizePath('my-cool-project');
  assert(result.endsWith('my-cool-project'));
})) passed++; else failed++;

if (test('path with underscores', () => {
  const result = sanitizePath('my_cool_project');
  assert(result.endsWith('my_cool_project'));
})) passed++; else failed++;

if (test('absolute path passes through', () => {
  const result = sanitizePath('/home/user/project');
  assertEqual(result, require('path').resolve('/home/user/project'));
})) passed++; else failed++;

if (test('Windows-style path with backslashes', () => {
  const result = sanitizePath('C:\\Users\\test\\project');
  // Backslashes aren't in the blocklist, so they pass through
  assert(result.includes('project'));
})) passed++; else failed++;

log('\n🚫 Injection patterns:', 'cyan');
if (test('semicolon throws', () => {
  assertThrows(() => sanitizePath('test;rm -rf /'), 'Invalid characters');
})) passed++; else failed++;

if (test('pipe throws', () => {
  assertThrows(() => sanitizePath('test|cat /etc/passwd'), 'Invalid characters');
})) passed++; else failed++;

if (test('backtick throws', () => {
  assertThrows(() => sanitizePath('test`id`'), 'Invalid characters');
})) passed++; else failed++;

if (test('dollar sign throws', () => {
  assertThrows(() => sanitizePath('test$(id)'), 'Invalid characters');
})) passed++; else failed++;

if (test('ampersand throws', () => {
  assertThrows(() => sanitizePath('test&command'), 'Invalid characters');
})) passed++; else failed++;

if (test('curly braces throw', () => {
  assertThrows(() => sanitizePath('test${var}'), 'Invalid characters');
})) passed++; else failed++;

if (test('angle bracket throws', () => {
  assertThrows(() => sanitizePath('test>file'), 'Invalid characters');
})) passed++; else failed++;

if (test('exclamation mark throws', () => {
  assertThrows(() => sanitizePath('test!command'), 'Invalid characters');
})) passed++; else failed++;

if (test('hash throws', () => {
  assertThrows(() => sanitizePath('test#comment'), 'Invalid characters');
})) passed++; else failed++;

if (test('tilde home-dir throws (~/)', () => {
  assertThrows(() => sanitizePath('~/home'), 'Invalid characters');
})) passed++; else failed++;

if (test('tilde user-home throws (~user/)', () => {
  assertThrows(() => sanitizePath('~root/path'), 'Invalid characters');
})) passed++; else failed++;

if (test('solitary tilde throws', () => {
  assertThrows(() => sanitizePath('~'), 'Invalid characters');
})) passed++; else failed++;

if (test('Windows short-name tilde allowed (~N)', () => {
  const result = sanitizePath('C:/Users/MEUPHI~1/project');
  assert(result.includes('project'));
})) passed++; else failed++;

if (test('Windows short-name tilde at end allowed', () => {
  const result = sanitizePath('MEUPHI~1');
  assert(result.includes('~1'));
})) passed++; else failed++;

if (test('multiple metacharacters throws', () => {
  assertThrows(() => sanitizePath('a;b|c`d`'), 'Invalid characters');
})) passed++; else failed++;

log('\n🔒 Traversal protection:', 'cyan');
if (test('simple traversal resolves to absolute', () => {
  const result = sanitizePath('../../etc/passwd');
  // Should resolve to an absolute path, not remain relative
  assert(require('path').isAbsolute(result), `Expected absolute path, got ${result}`);
})) passed++; else failed++;

if (test('deep traversal resolves to absolute', () => {
  const result = sanitizePath('valid/../../../etc');
  assert(require('path').isAbsolute(result));
})) passed++; else failed++;

// Summary
console.log('');
console.log('='.repeat(50));
log(`\n📊 Unit Test Results: ${passed} passed, ${failed} failed\n`, passed > 0 ? 'green' : 'red');

process.exit(failed > 0 ? 1 : 0);
