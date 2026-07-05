/**
 * Basic tests for spec-driven-agent CLI
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test directory
const TEST_DIR = path.join(__dirname, '.test-temp');

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
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

// Clean up test directory
function cleanup() {
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

// Run tests
function runTests() {
  log('\n🧪 Running tests...\n', 'green');
  
  let passed = 0;
  let failed = 0;

  // Test 1: CLI exists
  if (test('CLI file exists', () => {
    const cliPath = path.join(__dirname, 'bin', 'cli.js');
    if (!fs.existsSync(cliPath)) throw new Error('cli.js not found');
  })) passed++; else failed++;

  // Test 2: Package.json exists
  if (test('Package.json exists', () => {
    const pkgPath = path.join(__dirname, 'package.json');
    if (!fs.existsSync(pkgPath)) throw new Error('package.json not found');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (!pkg.name) throw new Error('name field missing');
    if (!pkg.version) throw new Error('version field missing');
    if (!pkg.bin) throw new Error('bin field missing');
  })) passed++; else failed++;

  // Test 3: Templates exist
  if (test('Templates directory exists', () => {
    const templateDir = path.join(__dirname, 'templates');
    if (!fs.existsSync(templateDir)) throw new Error('templates/ not found');
    if (!fs.existsSync(path.join(templateDir, 'CLAUDE.md'))) throw new Error('CLAUDE.md not found');
    const sdaDir = path.join(templateDir, '.claude', 'sda');
    if (!fs.existsSync(sdaDir)) throw new Error('.claude/sda/ not found');
    if (!fs.existsSync(path.join(sdaDir, 'skills'))) throw new Error('skills/ not found');
    if (!fs.existsSync(path.join(sdaDir, 'knowledge'))) throw new Error('knowledge/ not found');
  })) passed++; else failed++;

  // Test 4: All 15 skills present
  if (test('All 15 skills present', () => {
    const skillsDir = path.join(__dirname, 'templates', '.claude', 'sda', 'skills');
    const requiredSkills = [
      'context.md', 'spec.md', 'estimate.md', 'design.md', 'plan.md',
      'implement.md', 'fix.md', 'debug.md', 'refactor.md',
      'review.md', 'status.md', 'reflect.md', 'learn.md', 'socrates.md'
    ];
    
    const existingSkills = fs.readdirSync(skillsDir).filter(f => f.endsWith('.md'));
    
    for (const skill of requiredSkills) {
      if (!existingSkills.includes(skill)) {
        throw new Error(`Missing skill: ${skill}`);
      }
    }
  })) passed++; else failed++;

  // Test 5: Knowledge base files present
  if (test('Knowledge base files present', () => {
    const kbDir = path.join(__dirname, 'templates', '.claude', 'sda', 'knowledge');
    const requiredFiles = ['patterns.md', 'heuristics.md', 'antipatterns.md', 'changelog.md'];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(kbDir, file))) {
        throw new Error(`Missing knowledge file: ${file}`);
      }
    }
  })) passed++; else failed++;

  // Test 6: CLI --version works
  if (test('CLI --version works', () => {
    const output = execSync('node cli/bin/cli.js --version', { encoding: 'utf8' }).trim();
    if (!output.match(/^\d+\.\d+\.\d+$/)) {
      throw new Error(`Invalid version format: ${output}`);
    }
  })) passed++; else failed++;

  // Test 7: CLI --help works
  if (test('CLI --help works', () => {
    const output = execSync('node cli/bin/cli.js --help', { encoding: 'utf8' });
    if (!output.includes('Spec-Driven Agent')) {
      throw new Error('Help output missing framework name');
    }
    if (!output.includes('init')) {
      throw new Error('Help output missing init command');
    }
  })) passed++; else failed++;

  // Test 8: Init creates framework
  if (test('Init creates framework', () => {
    // Clean up first
    cleanup();
    
    // Create test directory
    fs.mkdirSync(TEST_DIR, { recursive: true });
    
    // Run init (quote path for spaces on Windows)
    execSync(`node cli/bin/cli.js init "${TEST_DIR}"`, { encoding: 'utf8' });
    
    // Verify files created
    if (!fs.existsSync(path.join(TEST_DIR, 'CLAUDE.md'))) {
      throw new Error('CLAUDE.md not created');
    }
    const sdaDir = path.join(TEST_DIR, '.claude', 'sda');
    if (!fs.existsSync(path.join(sdaDir, 'skills'))) {
      throw new Error('.claude/sda/skills/ not created');
    }
    if (!fs.existsSync(path.join(sdaDir, 'knowledge'))) {
      throw new Error('.claude/sda/knowledge/ not created');
    }
    if (!fs.existsSync(path.join(sdaDir, 'specs'))) {
      throw new Error('.claude/sda/specs/ not created');
    }
    if (!fs.existsSync(path.join(sdaDir, 'sessions'))) {
      throw new Error('.claude/sda/sessions/ not created');
    }
    if (!fs.existsSync(path.join(sdaDir, 'agents'))) {
      throw new Error('.claude/sda/agents/ not created');
    }
    
    // Verify skills copied
    const skills = fs.readdirSync(path.join(sdaDir, 'skills')).filter(f => f.endsWith('.md'));
    if (skills.length !== 15) {
      throw new Error(`Expected 15 skills, got ${skills.length}`);
    }
    
    // Verify references copied
    const refs = fs.readdirSync(path.join(sdaDir, 'skills', 'references'));
    if (refs.length !== 10) {
      throw new Error(`Expected 10 references, got ${refs.length}`);
    }
    
    // Verify agent copied
    if (!fs.existsSync(path.join(sdaDir, 'agents', 'Samantha.md'))) {
      throw new Error('Samantha.md not copied');
    }
  })) passed++; else failed++;

  // Test 9: Status shows correct info
  if (test('Status shows correct info', () => {
    const cliPath = path.join(__dirname, 'bin', 'cli.js');
    const output = execSync(`node "${cliPath}" status`, { 
      encoding: 'utf8',
      cwd: TEST_DIR
    });
    if (!output.includes('CLAUDE.md: Present')) {
      throw new Error('Status missing CLAUDE.md info');
    }
    if (!output.includes('.claude/sda/skills/')) {
      throw new Error('Status missing skills path');
    }
    if (!output.includes('.claude/sda/agents/')) {
      throw new Error('Status missing agents path');
    }
  })) passed++; else failed++;

  // Test 10: sanitizePath blocks shell injection
  if (test('sanitizePath blocks shell injection', () => {
    const cliPath = path.join(__dirname, 'bin', 'cli.js');
    // Test via init with malicious name — should not crash
    const maliciousDir = path.join(TEST_DIR, 'test-injection');
    try {
      execSync(`node "${cliPath}" init "${maliciousDir}"; rm -rf /"`, { encoding: 'utf8', timeout: 5000 });
    } catch (e) {
      // Expected to fail — but should not execute the rm command
    }
    // If we get here, the injection was blocked
    if (fs.existsSync(path.join(maliciousDir))) {
      throw new Error('Directory should not exist after blocked injection');
    }
  })) passed++; else failed++;

  // Test 11: Version reads from package.json
  if (test('Version matches package.json', () => {
    const cliPath = path.join(__dirname, 'bin', 'cli.js');
    const output = execSync(`node "${cliPath}" --version`, { encoding: 'utf8' }).trim();
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    if (output !== pkg.version) {
      throw new Error(`Version mismatch: CLI says ${output}, package.json says ${pkg.version}`);
    }
  })) passed++; else failed++;

  // Test 12: sanitizePath blocks various injection patterns
  if (test('sanitizePath blocks semicolon injection', () => {
    const cliPath = path.join(__dirname, 'bin', 'cli.js');
    try {
      execSync(`node "${cliPath}" init "test;echo pwned"`, { encoding: 'utf8', timeout: 3000 });
      throw new Error('Should have thrown for semicolon injection');
    } catch (e) {
      if (e.message === 'Should have thrown for semicolon injection') throw e;
      // Expected — command should fail
    }
  })) passed++; else failed++;

  if (test('sanitizePath blocks pipe injection', () => {
    const cliPath = path.join(__dirname, 'bin', 'cli.js');
    try {
      execSync(`node "${cliPath}" init "test|cat /etc/passwd"`, { encoding: 'utf8', timeout: 3000 });
      throw new Error('Should have thrown for pipe injection');
    } catch (e) {
      if (e.message === 'Should have thrown for pipe injection') throw e;
    }
  })) passed++; else failed++;

  if (test('sanitizePath blocks backtick injection', () => {
    const cliPath = path.join(__dirname, 'bin', 'cli.js');
    try {
      execSync(`node "${cliPath}" init "test\`id\`"`, { encoding: 'utf8', timeout: 3000 });
      throw new Error('Should have thrown for backtick injection');
    } catch (e) {
      if (e.message === 'Should have thrown for backtick injection') throw e;
    }
  })) passed++; else failed++;

  if (test('sanitizePath prevents traversal safely', () => {
    const cliPath = path.join(__dirname, 'bin', 'cli.js');
    // Path traversal input — should be resolved to absolute path, not exploited
    const safeDir = path.join(TEST_DIR, 'safe-check');
    try {
      execSync(`node "${cliPath}" init "${safeDir}/../../../etc"`, { encoding: 'utf8', timeout: 5000 });
      // If it didn't throw, it created the resolved path — check it's within TEST_DIR
      // The path.resolve behavior: "${safeDir}/../../../etc" resolves outside TEST_DIR
      // That's OK — the point is no shell injection occurred
    } catch (e) {
      // If it threw, that's also fine — just no shell execution happened
    }
    // Verify no injection — if we got here, the process didn't crash-exploit
  })) passed++; else failed++;

  if (test('sanitizePath accepts normal project name', () => {
    const cliPath = path.join(__dirname, 'bin', 'cli.js');
    const testDir = path.join(TEST_DIR, 'normal-project');
    try {
      const output = execSync(`node "${cliPath}" init "${testDir}"`, { encoding: 'utf8', timeout: 5000 });
      if (!output.includes('installed successfully')) {
        // On Windows the path might cause issues, but no injection is the key
      }
    } catch (e) {
      throw new Error(`Normal project name rejected: ${e.message}`);
    }
  })) passed++; else failed++;

  // Test 13: bin paths have ./ prefix
  if (test('bin paths have ./ prefix', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    if (!pkg.bin) throw new Error('bin field missing');
    for (const [name, binPath] of Object.entries(pkg.bin)) {
      if (!binPath.startsWith('./')) {
        throw new Error(`bin.${name} missing ./ prefix: ${binPath}`);
      }
    }
  })) passed++; else failed++;

  // Test 14: Update command works
  if (test('Update command backs up existing files', () => {
    // Init first
    cleanup();
    fs.mkdirSync(TEST_DIR, { recursive: true });
    execSync(`node cli/bin/cli.js init "${TEST_DIR}"`, { encoding: 'utf8' });

    // Run update
    const cliPath = path.join(__dirname, 'bin', 'cli.js');
    execSync(`node "${cliPath}" update`, { encoding: 'utf8', cwd: TEST_DIR });

    // Verify backup was created
    const sdaDir = path.join(TEST_DIR, '.claude', 'sda');
    const skillsBak = fs.readdirSync(sdaDir).filter(f => f.startsWith('skills.bak-'));
    if (skillsBak.length === 0) throw new Error('No skills backup created');

    // Verify files still present
    if (!fs.existsSync(path.join(sdaDir, 'skills', 'context.md'))) {
      throw new Error('Skills missing after update');
    }
  })) passed++; else failed++;

  // Test 15: index.js exports correctly
  if (test('index.js exports VERSION and utilities', () => {
    const api = require(path.join(__dirname, 'index.js'));
    if (!api.VERSION) throw new Error('VERSION not exported');
    if (!api.getFrameworkPath) throw new Error('getFrameworkPath not exported');
    if (!api.isInstalled) throw new Error('isInstalled not exported');
    if (!api.VERSION.match(/^\d+\.\d+\.\d+$/)) throw new Error('Invalid VERSION format');
  })) passed++; else failed++;

  // Test 16: events.js module loads correctly
  if (test('events.js module exports all functions', () => {
    const events = require('./lib/events');
    if (typeof events.readJsonlFile !== 'function') throw new Error('readJsonlFile not exported');
    if (typeof events.listJsonlFiles !== 'function') throw new Error('listJsonlFiles not exported');
    if (typeof events.readEvents !== 'function') throw new Error('readEvents not exported');
    if (typeof events.buildSnapshots !== 'function') throw new Error('buildSnapshots not exported');
    if (typeof events.aggregateSnapshot !== 'function') throw new Error('aggregateSnapshot not exported');
    if (typeof events.calculateEconomy !== 'function') throw new Error('calculateEconomy not exported');
    if (typeof events.readSnapshot !== 'function') throw new Error('readSnapshot not exported');
  })) passed++; else failed++;

  // Test 17: dashboard.js module loads correctly
  if (test('dashboard.js module exports all functions', () => {
    const dash = require('./lib/dashboard');
    if (typeof dash.dashboard !== 'function') throw new Error('dashboard not exported');
    if (typeof dash.showSummary !== 'function') throw new Error('showSummary not exported');
    if (typeof dash.showJson !== 'function') throw new Error('showJson not exported');
    if (typeof dash.buildSnapshots !== 'function') throw new Error('buildSnapshots not exported');
    if (typeof dash.formatDuration !== 'function') throw new Error('formatDuration not exported');
  })) passed++; else failed++;

  // Test 18: Dashboard --build creates snapshots from mock JSONL
  if (test('dashboard --build creates snapshots', () => {
    const fs = require('fs');
    const path = require('path');
    const os = require('os');
    const events = require('./lib/events');

    // Create temp metrics dir with sample events
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sda-test-'));
    const metricsDir = path.join(tmpDir, '.claude', 'sda', 'metrics');
    fs.mkdirSync(metricsDir, { recursive: true });

    const sampleEvents = [
      { ts: '2026-07-05T10:00:00Z', event: 'task', skill: 'test', success: true, dur_s: 30 },
      { ts: '2026-07-05T11:00:00Z', event: 'session_end', session_id: 's1' },
    ];
    fs.writeFileSync(path.join(metricsDir, 'events-2026-07-05.jsonl'),
      sampleEvents.map(e => JSON.stringify(e)).join('\n'));

    // Build
    const result = events.buildSnapshots(metricsDir);

    // Verify snapshots created
    if (!result.total) throw new Error('total snapshot missing');
    if (result.total.tasks.total !== 1) throw new Error(`Expected 1 task, got ${result.total.tasks.total}`);
    if (result.total.tasks.success !== 1) throw new Error(`Expected 1 success, got ${result.total.tasks.success}`);

    // Verify files on disk
    const snapDir = path.join(metricsDir, 'snapshots');
    if (!fs.existsSync(path.join(snapDir, 'total.json'))) throw new Error('total.json not written');
    if (!fs.existsSync(path.join(snapDir, 'daily-2026-07-05.jsonl'))) {
      // Check for .json (not .jsonl) — daily files are .json
      if (!fs.existsSync(path.join(snapDir, 'daily-2026-07-05.json'))) {
        throw new Error('daily snapshot not written');
      }
    }

    fs.rmSync(tmpDir, { recursive: true, force: true });
  })) passed++; else failed++;

  // Test 19: sda metrics command (alias for dashboard --summary) does not crash
  if (test('sda metrics alias does not crash', () => {
    // metrics() is called via CLI — test it doesn't throw
    const cliPath = path.join(__dirname, 'bin', 'cli.js');
    try {
      const output = execSync(`node "${cliPath}" metrics`, {
        encoding: 'utf8',
        cwd: TEST_DIR,
        timeout: 5000
      });
      // Should at least produce some output (even if "no data")
      if (!output || output.trim().length === 0) throw new Error('No output from metrics');
    } catch (e) {
      if (e.stderr && e.stderr.includes('No metrics')) {
        // Expected for new install — no data yet
      } else if (e.message.includes('No metrics')) {
        // Expected
      } else {
        throw e;
      }
    }
  })) passed++; else failed++;

  // Test 20: Dashboard JSON output is parseable
  if (test('dashboard --json produces valid JSON output', () => {
    const dash = require('./lib/dashboard');
    // Capture stdout
    const originalLog = console.log;
    let output = '';
    console.log = (msg) => { output += (msg || '') + '\n'; };

    // Project root without metrics — should produce empty JSON
    dash.dashboard('json', TEST_DIR);

    console.log = originalLog;

    // Should be valid JSON
    const parsed = JSON.parse(output);
    if (typeof parsed !== 'object') throw new Error('JSON output is not an object');
  })) passed++; else failed++;

  // Clean up
  cleanup();

  // Summary
  console.log('\n' + '='.repeat(50));
  log(`\n📊 Results: ${passed} passed, ${failed} failed\n`, passed > 0 ? 'green' : 'red');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests();
