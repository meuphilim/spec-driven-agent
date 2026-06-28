/**
 * Testes para Modo LITE do Spec-Driven Agent
 * Valida fluxo otimizado para tarefas simples (P)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TEST_DIR = path.join(__dirname, '.test-lite-temp');
const CLI_PATH = path.join(__dirname, 'bin', 'cli.js');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function test(name, fn) {
  try {
    fn();
    log(`✅ ${name}`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${name}: ${error.message}`, 'red');
    return false;
  }
}

function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

function runTests() {
  log('\n🧪 Lite Mode Tests\n', 'cyan');
  let passed = 0;
  let failed = 0;

  // Setup
  cleanup();
  fs.mkdirSync(TEST_DIR, { recursive: true });
  execSync(`node "${CLI_PATH}" init "${TEST_DIR}"`, { encoding: 'utf8' });

  // Test 1: CLAUDE.md contains LITE mode definition
  if (test('CLAUDE.md defines LITE mode', () => {
    const claude = fs.readFileSync(path.join(TEST_DIR, 'CLAUDE.md'), 'utf8');
    if (!claude.includes('Modo LITE')) throw new Error('Missing LITE mode definition');
    if (!claude.includes('CLASSIFY:P')) throw new Error('Missing LITE flow pattern');
    if (!claude.includes('REFLECT:1L')) throw new Error('Missing LITE reflect format');
  })) passed++; else failed++;

  // Test 2: CLAUDE.md contains dual-mode table
  if (test('CLAUDE.md has dual-mode table', () => {
    const claude = fs.readFileSync(path.join(TEST_DIR, 'CLAUDE.md'), 'utf8');
    if (!claude.includes('LITE') || !claude.includes('FULL')) throw new Error('Missing mode comparison');
    if (!claude.includes('~1.500')) throw new Error('Missing LITE token estimate');
    if (!claude.includes('~15.000')) throw new Error('Missing FULL token estimate');
  })) passed++; else failed++;

  // Test 3: Status skill supports LITE mode
  if (test('Status skill has LITE mode output', () => {
    const status = fs.readFileSync(path.join(TEST_DIR, '.claude/sda/skills/status.md'), 'utf8');
    if (!status.includes('Modo LITE')) throw new Error('Missing LITE mode in status');
    if (!status.includes('📊 [data]')) throw new Error('Missing compact status format');
  })) passed++; else failed++;

  // Test 4: Context skill has conditional loading
  if (test('Context skill has conditional knowledge loading', () => {
    const context = fs.readFileSync(path.join(TEST_DIR, '.claude/sda/skills/context.md'), 'utf8');
    if (!context.includes('Modo LITE')) throw new Error('Missing LITE mode in context');
    if (!context.includes('wc -l')) throw new Error('Missing conditional loading');
  })) passed++; else failed++;

  // Test 5: Reflect skill has LITE format
  if (test('Reflect skill has LITE format', () => {
    const reflect = fs.readFileSync(path.join(TEST_DIR, '.claude/sda/skills/reflect.md'), 'utf8');
    if (!reflect.includes('Modo LITE')) throw new Error('Missing LITE mode in reflect');
    if (!reflect.includes('📝')) throw new Error('Missing compact reflect format');
  })) passed++; else failed++;

  // Test 6: Init creates all required files
  if (test('Init creates complete structure', () => {
    const required = [
      'CLAUDE.md',
      '.claude/sda/skills/context.md',
      '.claude/sda/skills/spec.md',
      '.claude/sda/skills/reflect.md',
      '.claude/sda/skills/status.md',
      '.claude/sda/hooks/state.json',
      '.claude/sda/knowledge/patterns.md'
    ];
    for (const file of required) {
      if (!fs.existsSync(path.join(TEST_DIR, file))) {
        throw new Error(`Missing: ${file}`);
      }
    }
  })) passed++; else failed++;

  // Test 7: Version is consistent
  if (test('Version consistent across files', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    const cli = fs.readFileSync(path.join(__dirname, 'bin', 'cli.js'), 'utf8');
    const cliVersion = cli.match(/VERSION = require\('..\/package.json'\)\.version/);
    if (!cliVersion) throw new Error('CLI does not read version from package.json');
    if (pkg.version !== '5.0.0') throw new Error(`Expected 5.0.0, got ${pkg.version}`);
  })) passed++; else failed++;

  // Test 8: Ponytail skill present
  if (test('Ponytail skill integrated', () => {
    const ponytail = path.join(TEST_DIR, '.claude/sda/skills/ponytail');
    if (!fs.existsSync(ponytail)) throw new Error('Ponytail directory missing');
    if (!fs.existsSync(path.join(ponytail, 'ponytail.md'))) throw new Error('ponytail.md missing');
  })) passed++; else failed++;

  // Cleanup
  cleanup();

  // Summary
  console.log('\n' + '='.repeat(50));
  log(`\n📊 Results: ${passed} passed, ${failed} failed\n`, passed > 0 ? 'green' : 'red');
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
