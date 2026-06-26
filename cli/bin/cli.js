#!/usr/bin/env node

/**
 * Spec-Driven Agent CLI
 *
 * Usage:
 *   sda init [directory]      Initialize framework in directory (or current dir)
 *   sda update                Update skills and knowledge base
 *   sda status                Show framework status
 *   sda hooks init <project>  Initialize a session
 *   sda hooks status          Show current session state
 *   sda hooks validate        Validate gate consistency
 *   sda --version
 *   sda --help
 *
 * All framework files are installed under .claude/sda/ to avoid
 * conflicts with project-owned files (README.md, CHANGELOG.md,
 * skills/, hooks/, etc.).
 *
 * The only file placed at project root is CLAUDE.md, which Claude Code
 * requires at that exact location to load agent instructions.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const VERSION = '4.1.0';

// ─── Utilities ────────────────────────────────────────────────────────────────

function sanitizePath(input) {
  if (!input) return input;
  const normalized = path.normalize(input).replace(/^(\.\.[\\/\\])+/, '');
  if (/[;&|`$(){}!<>]/.test(normalized)) {
    throw new Error(`Invalid characters in project name: "${input}"`);
  }
  return normalized;
}

const colors = {
  reset: '\x1b[0m', bright: '\x1b[1m',
  red: '\x1b[31m',  green: '\x1b[32m', yellow: '\x1b[33m',
  blue: '\x1b[34m', cyan:  '\x1b[36m', white:  '\x1b[37m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color] || colors.reset}${msg}${colors.reset}`);
}
function logSuccess(msg) { log(`✅ ${msg}`, 'green');  }
function logError(msg)   { log(`❌ ${msg}`, 'red');    }
function logInfo(msg)    { log(`ℹ️  ${msg}`, 'cyan');  }
function logWarning(msg) { log(`⚠️  ${msg}`, 'yellow'); }

function getTemplateDir() {
  return path.join(__dirname, '..', 'templates');
}

/** Recursively copy src → dest. dest is created if absent. */
function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    entry.isDirectory() ? copyDirSync(s, d) : fs.copyFileSync(s, d);
  }
}

/**
 * Rename targetPath to a timestamped backup, return the backup name.
 * Used instead of overwriting, so existing user files are never lost.
 */
function backupExisting(targetPath) {
  const ts  = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const bak = `${targetPath}.bak-${ts}`;
  fs.renameSync(targetPath, bak);
  return path.basename(bak);
}

// ─── Conflict detection ───────────────────────────────────────────────────────

/**
 * Inspect destDir for known project structures and files that could
 * collide with framework installation.
 *
 * Returns:
 *   detected  — array of framework/language names found
 *   conflicts — array of { path, reason } for items needing attention
 */
function detectProjectStructure(destDir) {
  const exists = (p) => fs.existsSync(path.join(destDir, p));

  const signatures = [
    { name: 'Next.js',    files: ['next.config.js', 'next.config.mjs', 'next.config.ts'] },
    { name: 'NestJS',     files: ['nest-cli.json'] },
    { name: 'Vite',       files: ['vite.config.js', 'vite.config.ts', 'vite.config.mjs'] },
    { name: 'Vue',        files: ['vue.config.js'] },
    { name: 'Angular',    files: ['angular.json'] },
    { name: 'Turborepo',  files: ['turbo.json'] },
    { name: 'Nx',         files: ['nx.json'] },
    { name: 'Monorepo',   files: ['pnpm-workspace.yaml', 'lerna.json'] },
    { name: 'Go module',  files: ['go.mod'] },
    { name: 'Rust/Cargo', files: ['Cargo.toml'] },
    { name: 'Django',     files: ['manage.py'] },
    { name: 'Laravel',    files: ['artisan'] },
    { name: 'Spring',     files: ['pom.xml', 'build.gradle'] },
    { name: 'Docker',     files: ['docker-compose.yml', 'docker-compose.yaml', 'Dockerfile'] },
    { name: 'Makefile',   files: ['Makefile', 'makefile'] },
  ];

  const detected = signatures
    .filter(s => s.files.some(exists))
    .map(s => s.name);

  const conflicts = [];

  // Files that would be overwritten (all others now live in .claude/sda/)
  if (exists('CLAUDE.md'))
    conflicts.push({ path: 'CLAUDE.md', reason: 'existing Claude Code configuration' });

  // .claude/sda/ itself — safe to update in-place, but worth noting
  if (exists('.claude/sda'))
    conflicts.push({ path: '.claude/sda/', reason: 'previous SDA installation detected' });

  return { detected, conflicts };
}

// ─── init ─────────────────────────────────────────────────────────────────────

function init(targetDir) {
  const templateDir = getTemplateDir();
  const destDir     = path.resolve(sanitizePath(targetDir) || '.');

  log('\n🚀 Spec-Driven Agent v' + VERSION, 'bright');
  log('━'.repeat(50), 'cyan');
  log('');

  if (!fs.existsSync(destDir)) {
    logInfo(`Creating directory: ${destDir}`);
    fs.mkdirSync(destDir, { recursive: true });
  }

  // ── Detect & report ────────────────────────────────────────────────────────
  const { detected, conflicts } = detectProjectStructure(destDir);

  if (detected.length > 0)
    logInfo(`Detected: ${detected.join(', ')}`);

  if (conflicts.length > 0) {
    log('');
    logWarning('Existing files will be backed up before overwriting:');
    conflicts.forEach(c => log(`   ⚠  ${c.path} — ${c.reason}`, 'yellow'));
    log('');
  }

  logInfo('Installing framework files...');
  log('');

  try {
    // ── CLAUDE.md → project root (required by Claude Code) ─────────────────
    // This is the ONLY file placed outside .claude/
    const claudeSrc  = path.join(templateDir, 'CLAUDE.md');
    const claudeDest = path.join(destDir, 'CLAUDE.md');
    if (fs.existsSync(claudeDest)) {
      const bak = backupExisting(claudeDest);
      logWarning(`CLAUDE.md backed up → ${bak}`);
    }
    fs.copyFileSync(claudeSrc, claudeDest);
    logSuccess('CLAUDE.md (project root)');

    // ── .claude/sda/ — all framework artefacts, zero root pollution ────────
    const sdaRoot = path.join(destDir, '.claude', 'sda');

    // skills
    const prevSkills = path.join(sdaRoot, 'skills');
    if (fs.existsSync(prevSkills)) {
      const bak = backupExisting(prevSkills);
      logWarning(`.claude/sda/skills/ backed up → ${bak}`);
    }
    copyDirSync(path.join(templateDir, '.claude', 'sda', 'skills'), prevSkills);
    logSuccess('.claude/sda/skills/ (13 skills)');

    // knowledge
    const knowledgeDest = path.join(sdaRoot, 'knowledge');
    if (fs.existsSync(knowledgeDest)) {
      const bak = backupExisting(knowledgeDest);
      logWarning(`.claude/sda/knowledge/ backed up → ${bak}`);
    }
    copyDirSync(path.join(templateDir, '.claude', 'sda', 'knowledge'), knowledgeDest);
    logSuccess('.claude/sda/knowledge/');

    // specs (create-only — never overwrite user specs)
    const specsDest = path.join(sdaRoot, 'specs');
    if (!fs.existsSync(specsDest)) {
      copyDirSync(path.join(templateDir, '.claude', 'sda', 'specs'), specsDest);
      logSuccess('.claude/sda/specs/');
    } else {
      logInfo('.claude/sda/specs/ already exists — skipped');
    }

    // sessions (create-only — never overwrite session history)
    const sessionsDest = path.join(sdaRoot, 'sessions');
    if (!fs.existsSync(sessionsDest)) {
      copyDirSync(path.join(templateDir, '.claude', 'sda', 'sessions'), sessionsDest);
      logSuccess('.claude/sda/sessions/');
    } else {
      logInfo('.claude/sda/sessions/ already exists — skipped');
    }

    // hooks (backup existing, then install fresh)
    const hooksDest = path.join(sdaRoot, 'hooks');
    if (fs.existsSync(hooksDest)) {
      const bak = backupExisting(hooksDest);
      logWarning(`.claude/sda/hooks/ backed up → ${bak}`);
    }
    copyDirSync(path.join(templateDir, '.claude', 'sda', 'hooks'), hooksDest);

    // Make scripts executable (Unix / WSL / Git Bash)
    try {
      const { execSync } = require('child_process');
      execSync(`chmod +x "${hooksDest}"/*.sh 2>/dev/null || true`, { stdio: 'ignore' });
    } catch (_) { /* ignore on Windows without bash */ }

    logSuccess('.claude/sda/hooks/ (7 scripts)');

    // agents (backup existing, then install fresh)
    const agentsDest = path.join(sdaRoot, 'agents');
    if (fs.existsSync(agentsDest)) {
      const bak = backupExisting(agentsDest);
      logWarning(`.claude/sda/agents/ backed up → ${bak}`);
    }
    copyDirSync(path.join(templateDir, '.claude', 'sda', 'agents'), agentsDest);
    logSuccess('.claude/sda/agents/ (Samantha)');

    // skills/references (backup existing, then install fresh)
    const refsDest = path.join(sdaRoot, 'skills', 'references');
    if (fs.existsSync(refsDest)) {
      const bak = backupExisting(refsDest);
      logWarning(`.claude/sda/skills/references/ backed up → ${bak}`);
    }
    copyDirSync(path.join(templateDir, '.claude', 'sda', 'skills', 'references'), refsDest);
    logSuccess('.claude/sda/skills/references/ (5 guides)');

    // ── .gitignore — append SDA entries, never overwrite ───────────────────
    const giPath      = path.join(destDir, '.gitignore');
    const sdaEntries  = '\n# Spec-Driven Agent\n.claude/sda/hooks/state.json\n.claude/sda/hooks/state.history.log\n';
    if (fs.existsSync(giPath)) {
      const existing = fs.readFileSync(giPath, 'utf8');
      if (!existing.includes('Spec-Driven Agent')) {
        fs.appendFileSync(giPath, sdaEntries, 'utf8');
        logSuccess('.gitignore (SDA entries appended)');
      } else {
        logSuccess('.gitignore (already up to date)');
      }
    } else {
      fs.writeFileSync(giPath, sdaEntries.trimStart(), 'utf8');
      logSuccess('.gitignore (created)');
    }

    log('');
    log('━'.repeat(50), 'green');
    logSuccess('Framework installed successfully!');
    log('');
    log('Installed structure:', 'cyan');
    log('  CLAUDE.md                  ← loaded automatically by Claude Code', 'white');
    log('  .claude/sda/skills/        ← 13 skills + references/', 'white');
    log('  .claude/sda/knowledge/     ← patterns, heuristics, antipatterns', 'white');
    log('  .claude/sda/specs/         ← task specifications', 'white');
    log('  .claude/sda/sessions/      ← session history', 'white');
    log('  .claude/sda/hooks/         ← 7 bash scripts', 'white');
    log('  .claude/sda/agents/        ← Samantha agent', 'white');
    log('');
    logInfo('Next steps:');
    log('  1. Register hooks in Claude Code settings.json:', 'white');
    log('     PreToolUse  → bash .claude/sda/hooks/pre-tool.sh', 'white');
    log('     PostToolUse → bash .claude/sda/hooks/post-tool.sh', 'white');
    log('     Stop        → bash .claude/sda/hooks/stop.sh', 'white');
    log('  2. Run `sda hooks init <project-name>` to start a session', 'white');
    log('  3. Open project in Claude Code and use /context to begin', 'white');
    log('');
    logInfo('Documentation: https://github.com/meuphilim/spec-driven-agent');
    log('');

  } catch (error) {
    logError(`Installation failed: ${error.message}`);
    process.exit(1);
  }
}

// ─── update ───────────────────────────────────────────────────────────────────

function update() {
  log('\n🔄 Updating Spec-Driven Agent...', 'bright');
  log('');

  const templateDir = getTemplateDir();
  const currentDir  = process.cwd();
  const claudePath  = path.join(currentDir, 'CLAUDE.md');
  const sdaRoot     = path.join(currentDir, '.claude', 'sda');

  if (!fs.existsSync(claudePath)) {
    logError('Framework not found in current directory (CLAUDE.md missing)');
    logInfo('Run `sda init` first');
    process.exit(1);
  }

  try {
    // Update CLAUDE.md
    const bak = backupExisting(claudePath);
    logWarning(`CLAUDE.md backed up → ${bak}`);
    fs.copyFileSync(path.join(templateDir, 'CLAUDE.md'), claudePath);
    logSuccess('CLAUDE.md updated');

    // Update skills
    const skillsBak = backupExisting(path.join(sdaRoot, 'skills'));
    logWarning(`.claude/sda/skills/ backed up → ${skillsBak}`);
    copyDirSync(path.join(templateDir, '.claude', 'sda', 'skills'), path.join(sdaRoot, 'skills'));
    logSuccess('.claude/sda/skills/ updated');

    // Update knowledge
    const knowledgeBak = backupExisting(path.join(sdaRoot, 'knowledge'));
    logWarning(`.claude/sda/knowledge/ backed up → ${knowledgeBak}`);
    copyDirSync(path.join(templateDir, '.claude', 'sda', 'knowledge'), path.join(sdaRoot, 'knowledge'));
    logSuccess('.claude/sda/knowledge/ updated');

    // Update hooks
    const hooksBak = backupExisting(path.join(sdaRoot, 'hooks'));
    logWarning(`.claude/sda/hooks/ backed up → ${hooksBak}`);
    copyDirSync(path.join(templateDir, '.claude', 'sda', 'hooks'), path.join(sdaRoot, 'hooks'));
    try {
      const { execSync } = require('child_process');
      execSync(`chmod +x "${path.join(sdaRoot, 'hooks')}"/*.sh 2>/dev/null || true`, { stdio: 'ignore' });
    } catch (_) {}
    logSuccess('.claude/sda/hooks/ updated');

    // Update agents
    const agentsDest = path.join(sdaRoot, 'agents');
    if (fs.existsSync(agentsDest)) {
      const agentsBak = backupExisting(agentsDest);
      logWarning(`.claude/sda/agents/ backed up → ${agentsBak}`);
    }
    copyDirSync(path.join(templateDir, '.claude', 'sda', 'agents'), agentsDest);
    logSuccess('.claude/sda/agents/ updated');

    // Update references
    const refsDest = path.join(sdaRoot, 'skills', 'references');
    if (fs.existsSync(refsDest)) {
      const refsBak = backupExisting(refsDest);
      logWarning(`.claude/sda/skills/references/ backed up → ${refsBak}`);
    }
    copyDirSync(path.join(templateDir, '.claude', 'sda', 'skills', 'references'), refsDest);
    logSuccess('.claude/sda/skills/references/ updated');

    log('');
    logSuccess('Framework updated to v' + VERSION);

  } catch (error) {
    logError(`Update failed: ${error.message}`);
    process.exit(1);
  }
}

// ─── status ───────────────────────────────────────────────────────────────────

function status() {
  const currentDir = process.cwd();
  const sdaRoot    = path.join(currentDir, '.claude', 'sda');

  log('\n📊 Spec-Driven Agent Status', 'bright');
  log('━'.repeat(50), 'cyan');
  log('');

  const check = (rel, label, counter) => {
    const full = path.join(currentDir, rel);
    if (!fs.existsSync(full)) { logError(`${label}: Missing`); return; }
    if (counter) {
      const count = fs.readdirSync(full).filter(f => f.endsWith('.md') && f !== 'README.md').length;
      logSuccess(`${label}: ${count} files`);
    } else {
      logSuccess(`${label}: Present`);
    }
  };

  check('CLAUDE.md',                     'CLAUDE.md',              false);
  check('.claude/sda/skills',            '.claude/sda/skills/',    true);
  check('.claude/sda/knowledge',         '.claude/sda/knowledge/', true);
  check('.claude/sda/specs',             '.claude/sda/specs/',     true);
  check('.claude/sda/sessions',          '.claude/sda/sessions/',  true);
  check('.claude/sda/hooks',             '.claude/sda/hooks/',     false);
  check('.claude/sda/agents',            '.claude/sda/agents/',    true);

  const stateFile = path.join(sdaRoot, 'hooks', 'state.json');
  if (fs.existsSync(stateFile)) {
    try {
      const s = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      log('');
      log('Active session:', 'cyan');
      log(`  Session : ${s.session_id || '—'}`,                            'white');
      log(`  Phase   : ${s.phase}`,                                        'white');
      log(`  Turns   : ${s.turns?.current}/${s.turns?.max}`,               'white');
      log(`  GATEs   : spec=${s.gates?.spec}, plan=${s.gates?.plan}`,      'white');
      log(`  Spec    : ${s.active_spec || 'none'}`,                        'white');
    } catch (_) { logWarning('state.json found but could not be parsed'); }
  } else {
    log('');
    logInfo('No active session (run `sda hooks init <project>`)');
  }

  log('');
}

// ─── hooks commands ───────────────────────────────────────────────────────────

function getSdaHooksDir() {
  return path.join(process.cwd(), '.claude', 'sda', 'hooks');
}

function hooksInit(project) {
  const sanitized = sanitizePath(project);
  if (!sanitized) {
    logError('Usage: sda hooks init <project-name>');
    process.exit(1);
  }

  const hooksDir = getSdaHooksDir();
  if (!fs.existsSync(hooksDir)) {
    logError('.claude/sda/hooks/ not found');
    logInfo('Run `sda init` first');
    process.exit(1);
  }

  log('\n🔧 Initializing session...', 'bright');
  try {
    const { execFileSync } = require('child_process');
    execFileSync('bash', [path.join(hooksDir, 'init-session.sh'), sanitized], { stdio: 'inherit' });
  } catch (error) {
    logError(`Failed to initialize session: ${error.message}`);
    process.exit(1);
  }
}

function hooksStatus() {
  const stateFile = path.join(getSdaHooksDir(), 'state.json');
  if (!fs.existsSync(stateFile)) {
    logError('.claude/sda/hooks/state.json not found');
    logInfo('Run `sda hooks init <project>` first');
    process.exit(1);
  }

  try {
    const s = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    log('\n📊 Session State', 'bright');
    log('━'.repeat(40), 'cyan');
    log(`  Session  : ${s.session_id || '—'}`,                             'white');
    log(`  Project  : ${s.project || '—'}`,                                'white');
    log(`  Phase    : ${s.phase}`,                                         'white');
    log(`  Turns    : ${s.turns?.current}/${s.turns?.max}`,                'white');
    log(`  GATEs    : spec=${s.gates?.spec}, plan=${s.gates?.plan}, reflect=${s.gates?.reflect}`, 'white');
    log(`  Spec     : ${s.active_spec || 'none'}`,                         'white');
    log(`  Int.stop : ${s.intentional_stop}`,                              'white');
    log('');
  } catch (error) {
    logError(`Failed to read state: ${error.message}`);
    process.exit(1);
  }
}

function hooksValidate() {
  const stateFile = path.join(getSdaHooksDir(), 'state.json');
  if (!fs.existsSync(stateFile)) {
    logError('.claude/sda/hooks/state.json not found');
    logInfo('Run `sda hooks init <project>` first');
    process.exit(1);
  }

  try {
    const s      = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    const errors = [];
    const phase  = s.phase;

    const planPhases    = ['plan', 'execute', 'report', 'reflect', 'learn'];
    const executePhases = ['execute', 'report', 'reflect', 'learn'];

    if (planPhases.includes(phase) && s.gates?.spec !== 'approved')
      errors.push(`SPEC GATE not approved (phase: ${phase}, status: ${s.gates?.spec})`);

    if (executePhases.includes(phase) && s.gates?.plan !== 'approved')
      errors.push(`PLAN GATE not approved (phase: ${phase}, status: ${s.gates?.plan})`);

    if (s.turns?.current > s.turns?.max)
      errors.push(`Turn limit exceeded: ${s.turns.current}/${s.turns.max}`);

    if (errors.length > 0) {
      log('\n❌ Validation errors:', 'red');
      errors.forEach(e => log(`  - ${e}`, 'red'));
      log('');
      process.exit(1);
    } else {
      log('\n✅ All gates valid', 'green');
      log('');
    }
  } catch (error) {
    logError(`Validation failed: ${error.message}`);
    process.exit(1);
  }
}

// ─── help ─────────────────────────────────────────────────────────────────────

function showHelp() {
  log('\n🚀 Spec-Driven Agent CLI v' + VERSION, 'bright');
  log('');
  log('Usage:', 'cyan');
  log('  sda <command> [options]', 'white');
  log('');
  log('Commands:', 'cyan');
    log('  init [dir]           Install framework (default: current directory)', 'white');
    log('  update               Update CLAUDE.md, skills, knowledge, hooks, agents', 'white');
    log('  status               Show framework and session status', 'white');
    log('  hooks init <proj>    Initialize a new session', 'white');
    log('  hooks status         Show current session state', 'white');
    log('  hooks validate       Validate gate consistency', 'white');
    log('  help                 Show this message', 'white');
  log('');
  log('Options:', 'cyan');
  log('  --version, -v        Print version', 'white');
  log('  --help,    -h        Show help', 'white');
  log('');
    log('Installed structure (inside target project):', 'cyan');
    log('  CLAUDE.md                  ← project root (Claude Code requirement)', 'white');
    log('  .claude/sda/skills/        ← 13 skills + references/', 'white');
    log('  .claude/sda/knowledge/     ← patterns, heuristics, antipatterns', 'white');
    log('  .claude/sda/specs/         ← task specifications', 'white');
    log('  .claude/sda/sessions/      ← session history', 'white');
    log('  .claude/sda/hooks/         ← bash hooks + state.json', 'white');
    log('  .claude/sda/agents/        ← Samantha agent', 'white');
  log('');
  log('Documentation:', 'cyan');
  log('  https://github.com/meuphilim/spec-driven-agent', 'white');
  log('');
}

// ─── main ─────────────────────────────────────────────────────────────────────

function main() {
  const args    = process.argv.slice(2);
  const command = args[0];

  if (!command)                               { showHelp(); return; }
  if (command === '--version' || command === '-v') { console.log(VERSION); return; }
  if (command === '--help'    || command === '-h') { showHelp(); return; }

  switch (command) {
    case 'init':     init(args[1]);    break;
    case 'update':   update();         break;
    case 'status':   status();         break;
    case 'help':     showHelp();       break;
    case 'hooks': {
      const sub = args[1];
      if      (sub === 'init')     hooksInit(args[2]);
      else if (sub === 'status')   hooksStatus();
      else if (sub === 'validate') hooksValidate();
      else {
        logError(`Unknown hooks subcommand: ${sub || '(none)'}`);
        logInfo('Usage: sda hooks <init|status|validate>');
        process.exit(1);
      }
      break;
    }
    default:
      logError(`Unknown command: ${command}`);
      logInfo('Run `sda help` for usage');
      process.exit(1);
  }
}

main();
