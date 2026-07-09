#!/usr/bin/env node
/**
 * events-compact.js — Rotação e compactação de eventos JSONL
 *
 * Mantém eventos brutos por 90 dias (formato mensal: events-YYYY-MM.jsonl).
 * Após esse período:
 *   - Lê todas as linhas do mês
 *   - Agrega em snapshot mensal (monthly-YYYY-MM.snapshot.json)
 *   - Remove o JSONL bruto
 *
 * Execução: 1x/dia (controlado por touch file em .last-compact)
 * Cross-platform: Windows, Linux, macOS
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { getMetricsDir } = require('./_utils.js');

const RETENTION_DAYS = parseInt(process.env.SDA_EVENTS_RETENTION_DAYS || '90', 10);
const METRICS_DIR = getMetricsDir();
const COMPACT_MARKER = path.join(METRICS_DIR, '.last-compact');

function main() {
  const today = new Date().toISOString().slice(0, 10);

  // ─── Verificar se já rodou hoje ───
  if (fs.existsSync(COMPACT_MARKER)) {
    const lastRun = fs.readFileSync(COMPACT_MARKER, 'utf8').trim();
    if (lastRun === today) {
      process.exit(0); // Já rodou hoje
    }
  }

  // ─── Garantir que o diretório existe ───
  if (!fs.existsSync(METRICS_DIR)) {
    process.exit(0);
  }

  // ─── Calcular cutoff date ───
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  console.log(`🔍 Compaction: compactando eventos anteriores a ${cutoffStr}`);

  // ─── Para cada JSONL mensal (events-YYYY-MM.jsonl) ───
  const files = fs.readdirSync(METRICS_DIR)
    .filter(f => /^events-\d{4}-\d{2}\.jsonl$/.test(f));

  for (const file of files) {
    const monthKey = file.slice(7, 14); // events-YYYY-MM.jsonl → YYYY-MM
    const monthStart = monthKey + '-01'; // primeiro dia do mês para comparação

    // Compacta se o mês inteiro está antes do cutoff
    if (monthStart < cutoffStr) {
      const snapshotFile = path.join(METRICS_DIR, `monthly-${monthKey}.snapshot.json`);
      const filePath = path.join(METRICS_DIR, file);

      console.log(`  Compactando: ${file} → monthly-${monthKey}.snapshot.json`);

      // Ler eventos do arquivo
      const content = fs.readFileSync(filePath, 'utf8').trim();
      if (!content) {
        fs.unlinkSync(filePath);
        continue;
      }

      const events = content.split('\n')
        .map(l => { try { return JSON.parse(l); } catch (_) { return null; } })
        .filter(e => e);

      // Ler snapshot existente se houver
      let snap = { events: 0, tasks: 0, tokens: { total: 0 }, months: {} };
      if (fs.existsSync(snapshotFile)) {
        try { snap = JSON.parse(fs.readFileSync(snapshotFile, 'utf8')); } catch (_) {}
      }

      // Agregar
      snap.events += events.length;
      for (const e of events) {
        if (e.event === 'task') snap.tasks++;
        if (e.event === 'agent' && e.tokens && e.tokens.total) {
          snap.tokens.total += e.tokens.total;
        }
      }

      fs.writeFileSync(snapshotFile, JSON.stringify(snap, null, 2));
      fs.unlinkSync(filePath);
      console.log(`    → Removido: ${file}`);
    }
  }

  // ─── Registrar execução ───
  fs.writeFileSync(COMPACT_MARKER, today);
  console.log('✅ Compaction concluído');
  process.exit(0);
}

main();
