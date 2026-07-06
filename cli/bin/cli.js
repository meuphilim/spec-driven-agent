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
const { exec } = require('child_process');

const VERSION = require('../package.json').version;
const { sanitizePath } = require('../lib/sanitize');
const { dashboard } = require('../lib/dashboard');
const { createServer } = require('../lib/web-server');

// Marca scripts .sh como executáveis usando fs.chmodSync (sem shell,
// portanto sem risco de injeção de comando via path). No-op silencioso
// em plataformas onde chmod não se aplica (ex.: Windows).
function makeScriptsExecutable(dir) {
  if (!fs.existsSync(dir)) return;
  try {
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith('.sh')) {
        fs.chmodSync(path.join(dir, file), 0o755);
      }
    }
  } catch (_) { /* ignore on platforms without POSIX permissions */ }
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
    makeScriptsExecutable(hooksDest);

    logSuccess('.claude/sda/hooks/ (Node.js + shell)');

    // ── Auto-configurar hooks no Claude Code (settings.json) ──────────────
    const claudeSettingsPath = path.join(destDir, '.claude', 'settings.json');
    const hooksCfg = {
      hooks: {
        PreToolUse: [
          { command: 'node', args: ['.claude/sda/hooks/pre-tool.js'] }
        ],
        PostToolUse: [
          { command: 'node', args: ['.claude/sda/hooks/post-tool.js'] }
        ],
        Stop: [
          { command: 'node', args: ['.claude/sda/hooks/stop.js'] }
        ]
      }
    };
    // Só criar se não existir (nunca sobrescrever config do usuário)
    if (!fs.existsSync(claudeSettingsPath)) {
      fs.writeFileSync(claudeSettingsPath, JSON.stringify(hooksCfg, null, 2) + '\n');
      logSuccess('.claude/settings.json (hooks registrados)');
    } else {
      logInfo('.claude/settings.json already exists — skipped');
    }

    // ── Auto-configurar hooks no OpenCode (opencode/hooks.json) ──────────
    const opencodeHooksDir = path.join(destDir, '.opencode');
    const opencodeHooksPath = path.join(opencodeHooksDir, 'hooks.json');
    if (!fs.existsSync(opencodeHooksPath)) {
      if (!fs.existsSync(opencodeHooksDir)) {
        fs.mkdirSync(opencodeHooksDir, { recursive: true });
      }
      fs.writeFileSync(opencodeHooksPath, JSON.stringify(hooksCfg.hooks, null, 2) + '\n');
      logSuccess('.opencode/hooks.json (hooks registrados)');
    } else {
      logInfo('.opencode/hooks.json already exists — skipped');
    }

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
    logSuccess('.claude/sda/skills/references/ (8 guides)');

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
    log('  .claude/sda/hooks/         ← 7 scripts (Node.js + shell)', 'white');
    log('  .claude/sda/agents/        ← Samantha agent', 'white');
    log('  .claude/settings.json      ← hooks registrados (Claude Code)', 'white');
    log('  .opencode/hooks.json       ← hooks registrados (OpenCode)', 'white');
    log('');
    logInfo('Next steps:');
    log('  1. Run `sda hooks init <project-name>` to start a session', 'white');
    log('  2. Open project in Claude Code/OpenCode and use /context to begin', 'white');
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
    const skillsPath = path.join(sdaRoot, 'skills');
    if (fs.existsSync(skillsPath)) {
      const skillsBak = backupExisting(skillsPath);
      logWarning(`.claude/sda/skills/ backed up → ${skillsBak}`);
    }
    copyDirSync(path.join(templateDir, '.claude', 'sda', 'skills'), skillsPath);
    logSuccess('.claude/sda/skills/ updated');

    // Update knowledge
    const knowledgePath = path.join(sdaRoot, 'knowledge');
    if (fs.existsSync(knowledgePath)) {
      const knowledgeBak = backupExisting(knowledgePath);
      logWarning(`.claude/sda/knowledge/ backed up → ${knowledgeBak}`);
    }
    copyDirSync(path.join(templateDir, '.claude', 'sda', 'knowledge'), knowledgePath);
    logSuccess('.claude/sda/knowledge/ updated');

    // Update hooks
    const hooksPath = path.join(sdaRoot, 'hooks');
    if (fs.existsSync(hooksPath)) {
      const hooksBak = backupExisting(hooksPath);
      logWarning(`.claude/sda/hooks/ backed up → ${hooksBak}`);
    }
    copyDirSync(path.join(templateDir, '.claude', 'sda', 'hooks'), hooksPath);
    makeScriptsExecutable(hooksPath);
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

  const metricsFile = path.join(sdaRoot, 'metrics.json');
  if (fs.existsSync(metricsFile)) {
    try {
      const m = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
      const taskCount = m.tasks?.length || 0;
      logSuccess(`.claude/sda/metrics.json: ${taskCount} tasks recorded`);
    } catch (_) { logWarning('.claude/sda/metrics.json found but could not be parsed'); }
  } else {
    logInfo('.claude/sda/metrics.json: Not yet created');
  }

  const stateFile = path.join(sdaRoot, 'hooks', 'state.json');
  if (fs.existsSync(stateFile)) {
    try {
      const s = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
      log('');
      log('Active session:', 'cyan');
      log(`  Session : ${s.session_id || '—'}`,                            'white');
      log(`  Phase   : ${s.phase}`,                                        'white');
      log(`  Turns   : ${s.turns?.current}/${s.turns?.max}`,               'white');
      log(`  GATEs   : spec=${s.gates?.spec}, design=${s.gates?.design}, plan=${s.gates?.plan}`, 'white');
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

function getSdaMetricsDir() {
  return path.join(process.cwd(), '.claude', 'sda', 'metrics');
}

function hooksInit(project) {
  // Valida nome do projeto sem resolver como path absoluto
  if (!project || typeof project !== 'string' || project.trim().length === 0) {
    logError('Usage: sda hooks init <project-name>');
    process.exit(1);
  }
  // Mesma validação de sanitizePath mas sem path.resolve
  if (/[;&|`$(){}!<>#*?\[\]]/.test(project)) {
    logError(`Invalid project name: "${project}"`);
    process.exit(1);
  }
  const sanitized = project.trim();

  const hooksDir = getSdaHooksDir();
  if (!fs.existsSync(hooksDir)) {
    logError('.claude/sda/hooks/ not found');
    logInfo('Run `sda init` first');
    process.exit(1);
  }

  const metricsDir = getSdaMetricsDir();

  log('\n🔧 Initializing session...', 'bright');

  try {
    const sessionId = new Date().toISOString().slice(0, 10) + '-' + sanitized;
    const stateFile = path.join(hooksDir, 'state.json');
    const now = new Date().toISOString();

    // state.json (antes usava bash + jq, agora é Node.js puro)
    const state = {
      session_id: sessionId,
      project: sanitized,
      started_at: now,
      phase: 'init',
      classify: {},
      turns: { current: 0, max: 40, limit_80_warned: false },
      gates: { spec: 'none', design: 'none', plan: 'none', validate: 'none', reflect: 'none' },
      active_spec: null,
      scope_keywords: [],
      session_file: null,
      intentional_stop: false
    };
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n');

    // Evento session_start no JSONL
    const month = new Date().toISOString().slice(0, 7); // YYYY-MM
    const jsonlFile = path.join(metricsDir, `events-${month}.jsonl`);
    const event = {
      ts: now,
      event: 'session_start',
      session_id: sessionId,
      project: sanitized,
      model: 'unknown',
      mode: 'FULL'
    };
    fs.mkdirSync(path.dirname(jsonlFile), { recursive: true });
    fs.appendFileSync(jsonlFile, JSON.stringify(event) + '\n');

    log(`✅ Sessão inicializada: ${sessionId}`, 'green');
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
    log(`  GATEs    : spec=${s.gates?.spec}, design=${s.gates?.design}, plan=${s.gates?.plan}, validate=${s.gates?.validate}, reflect=${s.gates?.reflect}`, 'white');
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

// ─── metrics (alias for dashboard --summary) ─────────────────────────────────

function metrics() {
  dashboard('summary', process.cwd());
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
    log('  metrics              Show usage metrics (tasks, turns, success rate)', 'white');
    log('  dashboard --web [p]  Start web dashboard on port (default 3333)', 'white');
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

// ─── Browser helper ───────────────────────────────────────────────────────────

/**
 * Tenta abrir o navegador padrão com a URL fornecida.
 * Cross-platform: Windows (start), macOS (open), Linux (xdg-open).
 * Falha silenciosamente se não for possível (sem travar o servidor).
 * @param {string} url
 */
function openBrowser(url) {
  const cmd = process.platform === 'win32' ? 'start ""' :
              process.platform === 'darwin' ? 'open' :
              'xdg-open';

  exec(`${cmd} ${url}`, (err) => {
    if (err) {
      // Silencia o erro — o servidor continua rodando
      // O usuário já viu a URL no terminal
    }
  });
}

// ─── Web Dashboard ────────────────────────────────────────────────────────────

/**
 * Inicia o servidor HTTP do dashboard web.
 * @param {number} port - Porta inicial (auto-incrementa se ocupada)
 */
async function startWebDashboard(port) {
  const cwd = process.cwd();
  const metricsDir = path.join(cwd, '.claude', 'sda', 'metrics');
  const statePath = path.join(cwd, '.claude', 'sda', 'hooks', 'state.json');
  const webDistDir = path.join(__dirname, '..', 'web-dist');

  console.log('');
  console.log('\x1b[1m📊 Dashboard Web\x1b[0m');
  console.log('');

  try {
    const { url } = await createServer(metricsDir, statePath, webDistDir, port);
    console.log(`  \x1b[36mServidor rodando em:\x1b[0m  \x1b[1m${url}\x1b[0m`);
    console.log(`  \x1b[36mPressione Ctrl+C para encerrar\x1b[0m`);
    console.log('');

    // Tenta abrir o navegador automaticamente
    openBrowser(url);

    // Keep-alive (Ctrl+C encerra)
    process.on('SIGINT', () => {
      console.log('\n\x1b[32m✅ Dashboard web encerrado.\x1b[0m');
      process.exit(0);
    });
  } catch (err) {
    console.error(`\x1b[31m❌ ${err.message}\x1b[0m`);
    process.exit(1);
  }
}

// ─── main ─────────────────────────────────────────────────────────────────────

function main() {
  const args    = process.argv.slice(2);
  const command = args[0];

  if (!command)                               { showHelp(); return; }
  if (command === '--version' || command === '-v') { console.log(VERSION); return; }
  if (command === '--help'    || command === '-h') { showHelp(); return; }

  switch (command) {
    case 'init':      init(args[1]);    break;
    case 'update':    update();         break;
    case 'status':    status();         break;
    case 'metrics':   metrics();        break;
    case 'dashboard': {
      const sub = args[1];  // live, summary, json, build
      // --days N
      const daysIdx = args.indexOf('--days');
      const days = (daysIdx >= 0 && args[daysIdx + 1]) ? parseInt(args[daysIdx + 1], 10) : 0;
      // --web [port] ou --web --port N
      const webIdx = args.indexOf('--web');
      if (webIdx >= 0) {
        const portIdx = args.indexOf('--port');
        const port = portIdx >= 0 && args[portIdx + 1]
          ? parseInt(args[portIdx + 1], 10)
          : (args[webIdx + 1] && !args[webIdx + 1].startsWith('--')
            ? parseInt(args[webIdx + 1], 10)
            : 3333);
        startWebDashboard(port);
        break;
      }
      // Extrair subcomando ignorando flags
      const subcmd = sub && !sub.startsWith('--') ? sub : 'summary';
      dashboard(subcmd, process.cwd(), days);
      break;
    }
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
