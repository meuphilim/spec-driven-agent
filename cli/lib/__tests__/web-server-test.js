#!/usr/bin/env node
/**
 * Teste rápido do web-server.js (manual, para verificação)
 * Uso: node cli/lib/__tests__/web-server-test.js
 */

'use strict';

const path = require('path');
const http = require('http');
const { createServer } = require('../web-server');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const metricsDir = path.join(ROOT, '.claude', 'sda', 'metrics');
const statePath = path.join(ROOT, '.claude', 'sda', 'hooks', 'state.json');
const webDistDir = path.join(ROOT, 'cli', 'web-dist');

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    console.log(`  ✅ ${name}`);
    passed++;
  } else {
    console.log(`  ❌ ${name}`);
    failed++;
  }
}

async function fetch(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function fetchSSE(url, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let data = '';
      const timer = setTimeout(() => {
        res.destroy();
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      }, timeoutMs);
      res.on('data', chunk => {
        data += chunk;
        // Se já recebeu pelo menos um evento, pode parar
        if (data.includes('\n\n')) {
          clearTimeout(timer);
          res.destroy();
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
      res.on('error', (e) => { clearTimeout(timer); reject(e); });
    });
    req.on('error', reject);
  });
}

async function main() {
  console.log('');
  console.log('\x1b[1m🧪 Web Server Tests\x1b[0m');
  console.log('');

  // 1. Create server
  let server, url, port;
  try {
    const result = await createServer(metricsDir, statePath, webDistDir, 3390);
    server = result.server;
    url = result.url;
    port = result.port;
    console.log(`  ℹ️  Server on port ${port}`);
  } catch (e) {
    console.log(`  ❌ Server creation failed: ${e.message}`);
    failed++;
    process.exit(1);
  }

  try {
    // 2. GET / → index.html
    const indexResp = await fetch(url + '/');
    assert('GET / returns 200', indexResp.status === 200);
    assert('GET / returns text/html', indexResp.headers['content-type'] && indexResp.headers['content-type'].startsWith('text/html'));
    assert('GET / contains Dashboard', indexResp.body.includes('Dashboard') || indexResp.body.includes('Sessão'));

    // 3. GET /api/snapshot → JSON
    const snapResp = await fetch(url + '/api/snapshot');
    assert('GET /api/snapshot returns 200', snapResp.status === 200);
    assert('GET /api/snapshot returns JSON', snapResp.headers['content-type'] && snapResp.headers['content-type'].startsWith('application/json'));
    const snap = JSON.parse(snapResp.body);
    assert('GET /api/snapshot has valid JSON body', typeof snap === 'object');
    // Pode ser empty ou ter dados
    assert('GET /api/snapshot has empty or tasks property', 'empty' in snap || 'tasks' in snap);

    // 4. GET /api/live → SSE (usa fetchSSE que fecha após 2s ou 1º evento)
    const liveResp = await fetchSSE(url + '/api/live', 3000);
    assert('GET /api/live returns 200', liveResp.status === 200);
    assert('GET /api/live is text/event-stream', liveResp.headers['content-type'] && liveResp.headers['content-type'].startsWith('text/event-stream'));
    assert('GET /api/live has SSE data', liveResp.body.startsWith('data: '));

    // 5. No CORS headers (intencional — same-origin, bind 127.0.0.1)
    const corsResp = await fetch(url + '/api/snapshot');
    assert('No CORS headers (same-origin)', !corsResp.headers['access-control-allow-origin']);

    // 6. 404 for unknown file
    const notFoundResp = await fetch(url + '/nonexistent-file.xyz');
    assert('GET /nonexistent returns 404', notFoundResp.status === 404);

  } finally {
    server.close();
  }

  // Summary
  console.log('');
  console.log(`\x1b[1mResults: ${passed} passed, ${failed} failed\x1b[0m`);
  console.log('');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error('Unhandled:', e);
  process.exit(1);
});
