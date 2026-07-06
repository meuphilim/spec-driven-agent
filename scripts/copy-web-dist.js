#!/usr/bin/env node

/**
 * copy-web-dist.js — Copia build do dashboard-web para cli/web-dist/
 *
 * Uso:
 *   node scripts/copy-web-dist.js
 *
 * Fluxo:
 *   1. Lê dashboard-web/dist/
 *   2. Cria cli/web-dist/ se não existir
 *   3. Copia todos os arquivos (mantendo estrutura)
 *   4. Log do que copiou
 *
 * Chamado por:
 *   - npm run build:web (root ou cli/)
 *   - .github/workflows/release.yml (CI)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'dashboard-web', 'dist');
const DEST = path.join(ROOT, 'cli', 'web-dist');

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`❌ Source not found: ${src}`);
    console.error(`   Run 'cd dashboard-web && npm run build' first.`);
    process.exit(1);
  }

  // Limpa destino antes de copiar (evita acumular assets obsoletos)
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      count += copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }

  return count;
}

// Executa
const count = copyRecursive(SRC, DEST);
console.log(`✅ Web dashboard assets copied: ${count} files`);
console.log(`   ${SRC} → ${DEST}`);
