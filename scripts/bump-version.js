#!/usr/bin/env node
/**
 * bump-version.js — Script de bump de versão para Spec-Driven Agent
 *
 * Uso:
 *   node scripts/bump-version.js 5.3.0                         # bump automático
 *   node scripts/bump-version.js 5.3.0 --test-count 92         # override contagem de testes
 *   node scripts/bump-version.js --dry-run 5.3.0               # apenas mostra o que faria
 *
 * O que atualiza:
 *   - cli/package.json        → version
 *   - package.json            → version (workspace root)
 *   - README.md               → badges, test count, roadmap
 *   - README_en.md            → badges, test count, roadmap
 *   - cli/README.md           → badges, test count, roadmap
 *   - cli/README_en.md        → badges, test count, roadmap
 *   - SECURITY.md             → version support table (major bump)
 *   - SECURITY_pt.md          → version support table (major bump)
 *   - SESSION-TEMPLATE.md     → version string
 *   - SESSION-TEMPLATE_en.md  → version string
 */

const fs = require('fs');
const path = require('path');

// --- Config ---
const ROOT = path.resolve(__dirname, '..');
const FILES = {
  rootPkg: path.join(ROOT, 'package.json'),
  cliPkg: path.join(ROOT, 'cli', 'package.json'),
  readme: path.join(ROOT, 'README.md'),
  readmeEn: path.join(ROOT, 'README_en.md'),
  cliReadme: path.join(ROOT, 'cli', 'README.md'),
  cliReadmeEn: path.join(ROOT, 'cli', 'README_en.md'),
  security: path.join(ROOT, 'SECURITY.md'),
  securityPt: path.join(ROOT, 'SECURITY_pt.md'),
  sessionTemplate: path.join(ROOT, 'SESSION-TEMPLATE.md'),
  sessionTemplateEn: path.join(ROOT, 'SESSION-TEMPLATE_en.md'),
};

// --- Helpers ---
function read(file) { return fs.readFileSync(file, 'utf8'); }
function write(file, content) { fs.writeFileSync(file, content, 'utf8'); console.log(`  ✏️  ${path.relative(ROOT, file)}`); }

function parseVersion(v) {
  const m = v.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!m) throw new Error(`Invalid semver: ${v}. Use X.Y.Z`);
  return { major: m[1], minor: m[2], patch: m[3], full: v };
}

function countTests() {
  const testFiles = [
    path.join(ROOT, 'cli', 'test.js'),
    path.join(ROOT, 'cli', 'test-lite.js'),
    path.join(ROOT, 'cli', 'test-unit.js'),
    path.join(ROOT, 'cli', 'lib', '__tests__', 'dashboard.test.js'),
    path.join(ROOT, 'cli', 'lib', '__tests__', 'events.test.js'),
  ];
  let total = 0;
  for (const f of testFiles) {
    if (!fs.existsSync(f)) continue;
    const content = read(f);
    const tests = content.match(/(test|it)\(['"`]/gm);
    if (tests) total += tests.length;
  }
  return total || 87;
}

// --- Patchers ---
function patchJson(file, key, value) {
  if (dryRun) { console.log(`  [dry-run] ${path.relative(ROOT, file)} → "${key}": "${value}"`); return; }
  const obj = JSON.parse(read(file));
  const parts = key.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
  cur[parts[parts.length - 1]] = value;
  write(file, JSON.stringify(obj, null, 2) + '\n');
}

function replaceInFile(file, pattern, replacement) {
  if (!fs.existsSync(file)) return;
  if (dryRun) {
    const match = read(file).match(pattern);
    if (match) console.log(`  [dry-run] ${path.relative(ROOT, file)}: ${match[0].substring(0, 60)} → ${replacement.substring(0, 60)}`);
    return;
  }
  const content = read(file);
  if (!pattern.test(content)) {
    console.warn(`  ⚠️  Pattern not found in ${path.relative(ROOT, file)}: ${pattern}`);
    return;
  }
  write(file, content.replace(pattern, replacement));
}

// --- Main ---
const args = process.argv.slice(2);
const versionArg = args.find(a => /^\d+\.\d+\.\d+$/.test(a));
const dryRun = args.includes('--dry-run');
const testCountArg = args.includes('--test-count') ? parseInt(args[args.indexOf('--test-count') + 1], 10) : null;

if (!versionArg) {
  console.error('Usage: node scripts/bump-version.js <X.Y.Z> [--test-count N] [--dry-run]');
  console.error('Example: node scripts/bump-version.js 5.3.0');
  process.exit(1);
}

const NEW = parseVersion(versionArg);
const testCount = testCountArg || countTests();

console.log(`\n📦 Bumping version to ${NEW.full}`);
console.log(`   Test count: ${testCount}`);
console.log(`   Dry run: ${dryRun ? 'YES' : 'no'}\n`);

// 1. Package files
console.log('📄 Package files:');
patchJson(FILES.cliPkg, 'version', NEW.full);
patchJson(FILES.rootPkg, 'version', NEW.full);

// 2. README files
console.log('\n📖 README files:');
replaceInFile(FILES.readme, /5\.\d+\.\d+/g, NEW.full);
replaceInFile(FILES.readme, /tests-\d+%2F\d+/g, `tests-${testCount}%2F${testCount}`);
replaceInFile(FILES.readme, /\*\*Total: \d+ testes/g, `**Total: ${testCount} testes`);

replaceInFile(FILES.readmeEn, /5\.\d+\.\d+/g, NEW.full);
replaceInFile(FILES.readmeEn, /tests-\d+%2F\d+/g, `tests-${testCount}%2F${testCount}`);
replaceInFile(FILES.readmeEn, /\*\*Total: \d+ tests/g, `**Total: ${testCount} tests`);

replaceInFile(FILES.cliReadme, /5\.\d+\.\d+/g, NEW.full);
replaceInFile(FILES.cliReadme, /tests-\d+%2F\d+/g, `tests-${testCount}%2F${testCount}`);
replaceInFile(FILES.cliReadme, /\*\*Total: \d+ testes/g, `**Total: ${testCount} testes`);

replaceInFile(FILES.cliReadmeEn, /5\.\d+\.\d+/g, NEW.full);
replaceInFile(FILES.cliReadmeEn, /tests-\d+%2F\d+/g, `tests-${testCount}%2F${testCount}`);
replaceInFile(FILES.cliReadmeEn, /\*\*Total: \d+ tests/g, `**Total: ${testCount} tests`);

// 3. SECURITY — add new major version line
console.log('\n🔒 Security files:');
for (const file of [FILES.security, FILES.securityPt]) {
  const secContent = read(file);
  const tableLine = `| ${NEW.major}.x | ✅ |`;
  if (!secContent.includes(tableLine)) {
    const lines = secContent.split('\n');
    const headerIdx = lines.findIndex(l => /^\| (Version|Versão) \|/.test(l));
    if (headerIdx >= 0) {
      // insert after header row (index) + separator row (index+1)
      lines.splice(headerIdx + 2, 0, `| ${NEW.major}.x | ✅ |`);
      if (!dryRun) write(file, lines.join('\n'));
      console.log(`  ✏️  ${path.relative(ROOT, file)} — added v${NEW.major}.x support`);
    }
  } else {
    console.log(`  ✓ ${path.relative(ROOT, file)} — already has v${NEW.major}.x`);
  }
}

// 4. Session templates
console.log('\n📋 Session templates:');
replaceInFile(FILES.sessionTemplate, /\*\*Versão:\*\* \d+\.\d+\.\d+/, `**Versão:** ${NEW.full}`);
replaceInFile(FILES.sessionTemplateEn, /\*\*Version:\*\* \d+\.\d+\.\d+/, `**Version:** ${NEW.full}`);

// Summary
console.log(`\n✅ Bump to ${NEW.full} complete.`);
console.log(`   ${dryRun ? '(dry run — no files written)' : 'All files updated.'}`);
console.log('\n   Next steps:');
console.log(`   1. Review the changes with git diff`);
console.log(`   2. Add CHANGELOG entry manually`);
console.log(`   3. Commit: git commit -m "chore: bump version to ${NEW.full}"`);
console.log(`   4. Tag:     git tag v${NEW.full}`);
