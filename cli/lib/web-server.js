/**
 * web-server.js — Servidor HTTP nativo para o Dashboard Web
 *
 * Dependências: apenas http, fs, path (nativos — zero npm packages novos)
 *
 * Rotas:
 *   GET /api/snapshot → JSON do snapshot total
 *   GET /api/live     → SSE stream com estado da sessão
 *   GET /*            → arquivo estático de webDistDir
 *
 * Uso:
 *   const server = require('./web-server');
 *   const { server, url } = server.createServer(metricsDir, statePath, webDistDir, 3333);
 *
 * Design decisions:
 *   - Bind 127.0.0.1 only (nunca exposto em rede)
 *   - Porta auto-incremento se ocupada (até +10)
 *   - SSE polling a cada 1s, só envia se state.json mudou
 *   - Sem CORS (front-end e API são same-origin)
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const events = require('./events');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

// ─── SSE helpers ────────────────────────────────────────────────────────────

/**
 * Envia um evento SSE.
 * @param {http.ServerResponse} res
 * @param {object} data
 */
function sendSSE(res, data) {
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * Lê o state.json da sessão atual.
 * @param {string} statePath
 * @returns {object|null}
 */
function readState(statePath) {
  if (!fs.existsSync(statePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch (_) {
    return null;
  }
}

// ─── Handlers ───────────────────────────────────────────────────────────────

/**
 * Handler: GET /api/snapshot → JSON do snapshot total
 * @param {http.ServerResponse} res
 * @param {string} metricsDir
 */
function handleSnapshot(res, metricsDir) {
  let snap = events.readSnapshot(metricsDir, 'total');

  // Se snapshot não existe ou stale, reconstrói
  if (!snap) {
    try {
      const built = events.buildSnapshots(metricsDir);
      snap = built.total;
    } catch (_) {
      snap = null;
    }
  }

  if (!snap || !snap.tasks || snap.tasks.total === 0) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      empty: true,
      message: 'Nenhum dado de métricas ainda. As métricas aparecem após a primeira tarefa ser concluída.',
    }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(snap));
}

/**
 * Handler: GET /api/live → SSE stream
 * @param {http.ServerResponse} res
 * @param {string} statePath
 */
function handleLiveSSE(res, statePath) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  let lastStateJson = '';

  // Envia estado inicial imediatamente
  const initial = readState(statePath);
  sendSSE(res, formatSessionState(initial));
  if (initial) lastStateJson = JSON.stringify(initial);

  // Polling a cada 1s, só envia se mudou
  const interval = setInterval(() => {
    try {
      const state = readState(statePath);
      const stateJson = JSON.stringify(state);

      // Só envia se o state.json mudou desde a última leitura
      if (stateJson !== lastStateJson) {
        sendSSE(res, formatSessionState(state));
        lastStateJson = stateJson;
      }
    } catch (_) {
      // Se erro na leitura, ignora
    }
  }, 1000);

  // Cleanup na desconexão
  res.on('close', () => {
    clearInterval(interval);
  });
}

/**
 * Formata o state.json para o formato SSE.
 * @param {object|null} state
 * @returns {object}
 */
function formatSessionState(state) {
  if (!state) {
    return {
      session_active: false,
      ts: new Date().toISOString(),
    };
  }

  return {
    session_active: true,
    phase: state.phase || '—',
    mode: state.mode || 'FULL',
    turn: state.turns?.current || 0,
    max_turns: state.turns?.max || 40,
    spec: state.active_spec || '—',
    gates: {
      spec: state.gates?.spec || '—',
      design: state.gates?.design || '—',
      plan: state.gates?.plan || '—',
    },
    ts: new Date().toISOString(),
  };
}

/**
 * Handler: arquivo estático
 * @param {http.ServerResponse} res
 * @param {string} urlPath
 * @param {string} webDistDir
 */
function handleStatic(res, urlPath, webDistDir) {
  // Sanitize: prevenir path traversal
  const safePath = path.normalize(urlPath).replace(/^[/\\]?(\.\.)[/\\]/, '');
  const filePath = path.join(webDistDir, safePath);

  // Verifica se está dentro de webDistDir
  if (!filePath.startsWith(webDistDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    // Fallback: tenta index.html (para SPA-like)
    const fallback = path.join(filePath, 'index.html');
    if (fs.existsSync(fallback)) {
      const ext = path.extname(fallback);
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(fallback));
      return;
    }

    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
  res.end(fs.readFileSync(filePath));
}

// ─── Server factory ─────────────────────────────────────────────────────────

/**
 * Cria e inicia o servidor HTTP.
 *
 * @param {string} metricsDir  - Caminho para .claude/sda/metrics/
 * @param {string} statePath   - Caminho para .claude/sda/hooks/state.json
 * @param {string} webDistDir  - Caminho para cli/web-dist/
 * @param {number} [port=3333] - Porta inicial (auto-incrementa se ocupada)
 * @returns {Promise<{server: http.Server, url: string, port: number}>}
 */
async function createServer(metricsDir, statePath, webDistDir, port = 3333) {
  // Valida webDistDir
  if (!fs.existsSync(webDistDir)) {
    throw new Error(
      `Web dashboard assets not found at: ${webDistDir}\n` +
      `Run 'npm run build:web' (root) or 'cd dashboard-web && npm run build' first.`
    );
  }

  if (!fs.existsSync(webDistDir + '/index.html') && !fs.existsSync(path.join(webDistDir, 'index.html'))) {
    throw new Error(
      `No index.html found in ${webDistDir}. Build may be incomplete.\n` +
      `Run 'npm run build:web' to rebuild.`
    );
  }

  const requestHandler = (req, res) => {
    // Sem CORS — front-end e API são same-origin
    // bind exclusivo em 127.0.0.1

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    if (pathname === '/api/snapshot') {
      handleSnapshot(res, metricsDir);
    } else if (pathname === '/api/live') {
      handleLiveSSE(res, statePath);
    } else {
      // Arquivos estáticos de webDistDir
      handleStatic(res, pathname, webDistDir);
    }
  };

  // Tenta bind na porta, auto-incremento até +10
  return new Promise((resolve, reject) => {
    const maxPort = port + 10;
    let currentPort = port;

    const tryBind = () => {
      const server = http.createServer(requestHandler);

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && currentPort < maxPort) {
          currentPort++;
          tryBind();
        } else if (err.code === 'EADDRINUSE') {
          reject(new Error(`No available ports in range ${port}-${maxPort - 1}`));
        } else {
          reject(err);
        }
      });

      server.listen(currentPort, '127.0.0.1', () => {
        resolve({
          server,
          url: `http://127.0.0.1:${currentPort}`,
          port: currentPort,
        });
      });
    };

    tryBind();
  });
}

module.exports = { createServer, readState, formatSessionState };
