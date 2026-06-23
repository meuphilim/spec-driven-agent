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
    if (!fs.existsSync(path.join(templateDir, 'skills'))) throw new Error('skills/ not found');
    if (!fs.existsSync(path.join(templateDir, '.knowledge'))) throw new Error('.knowledge/ not found');
  })) passed++; else failed++;

  // Test 4: All 13 skills present
  if (test('All 13 skills present', () => {
    const skillsDir = path.join(__dirname, 'templates', 'skills');
    const requiredSkills = [
      'context.md', 'spec.md', 'estimate.md', 'plan.md',
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
    const kbDir = path.join(__dirname, 'templates', '.knowledge');
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
    
    // Run init
    execSync(`node cli/bin/cli.js init ${TEST_DIR}`, { encoding: 'utf8' });
    
    // Verify files created
    if (!fs.existsSync(path.join(TEST_DIR, 'CLAUDE.md'))) {
      throw new Error('CLAUDE.md not created');
    }
    if (!fs.existsSync(path.join(TEST_DIR, 'skills'))) {
      throw new Error('skills/ not created');
    }
    if (!fs.existsSync(path.join(TEST_DIR, '.knowledge'))) {
      throw new Error('.knowledge/ not created');
    }
    if (!fs.existsSync(path.join(TEST_DIR, '.specs'))) {
      throw new Error('.specs/ not created');
    }
    if (!fs.existsSync(path.join(TEST_DIR, '.sessions'))) {
      throw new Error('.sessions/ not created');
    }
    
    // Verify skills copied
    const skills = fs.readdirSync(path.join(TEST_DIR, 'skills')).filter(f => f.endsWith('.md'));
    if (skills.length !== 13) {
      throw new Error(`Expected 13 skills, got ${skills.length}`);
    }
  })) passed++; else failed++;

  // Test 9: Status shows correct info
  if (test('Status shows correct info', () => {
    const cliPath = path.join(__dirname, 'bin', 'cli.js');
    const output = execSync(`node ${cliPath} status`, { 
      encoding: 'utf8',
      cwd: TEST_DIR
    });
    if (!output.includes('CLAUDE.md: Present')) {
      throw new Error('Status missing CLAUDE.md info');
    }
    if (!output.includes('Skills: 13 files')) {
      throw new Error('Status missing skills count');
    }
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
