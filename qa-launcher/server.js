// QA Launcher — local form that starts a headless Claude Code QA run.
// Run:  node qa-launcher/server.js   then open http://localhost:4000
// No npm dependencies. Binds to 127.0.0.1 only (it can run Claude with tool permissions).

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, execFile } = require('child_process');
const { buildPrompt } = require('./prompt');

const PORT = Number(process.env.QA_LAUNCHER_PORT) || 4000;
const REPO_ROOT = path.resolve(__dirname, '..');
const KB_DIR = path.join(REPO_ROOT, 'my-playwright-project', 'qa-knowledge-base');
const JOBS_DIR = path.join(__dirname, 'jobs');
const PUBLIC_DIR = path.join(__dirname, 'public');

const PERMISSION_MODES = ['auto', 'acceptEdits', 'dontAsk', 'bypassPermissions'];
const MODELS = ['', 'opus', 'sonnet', 'haiku'];

fs.mkdirSync(JOBS_DIR, { recursive: true });

// ---------- job store ----------
const jobs = new Map();       // id -> job meta (persisted to jobs/<id>/job.json)
const listeners = new Map();  // id -> Set<res> (SSE clients)
const queue = [];             // ids waiting to run
let running = null;           // { id, child }

function jobDir(id) { return path.join(JOBS_DIR, id); }
function saveJob(job) { fs.writeFileSync(path.join(jobDir(job.id), 'job.json'), JSON.stringify(job, null, 2)); }

function loadJobs() {
  for (const id of fs.readdirSync(JOBS_DIR)) {
    const f = path.join(JOBS_DIR, id, 'job.json');
    if (!fs.existsSync(f)) continue;
    try {
      const job = JSON.parse(fs.readFileSync(f, 'utf8'));
      if (job.status === 'running' || job.status === 'queued') job.status = 'interrupted';
      jobs.set(job.id, job);
    } catch { /* skip corrupt job */ }
  }
}

function newId(form) {
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const slug = String(form.ticket || 'qa').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'qa';
  let id = `${stamp}-${slug}`;
  for (let n = 2; jobs.has(id); n++) id = `${stamp}-${slug}-${n}`;
  return id;
}

// ---------- events / SSE ----------
function emit(id, evt) {
  evt.t = Date.now();
  fs.appendFileSync(path.join(jobDir(id), 'events.ndjson'), JSON.stringify(evt) + '\n');
  for (const res of listeners.get(id) || []) res.write(`data: ${JSON.stringify(evt)}\n\n`);
}

function setStatus(job, status, extra = {}) {
  Object.assign(job, { status }, extra);
  saveJob(job);
  emit(job.id, { kind: 'status', status, ...extra });
}

// Turn one stream-json line from `claude -p` into compact UI events.
function handleStreamLine(job, line) {
  let msg;
  try { msg = JSON.parse(line); } catch { return emit(job.id, { kind: 'raw', text: line }); }

  if (msg.type === 'system' && msg.subtype === 'init') {
    job.sessionId = msg.session_id;
    saveJob(job);
    return emit(job.id, { kind: 'init', sessionId: msg.session_id, model: msg.model });
  }
  if (msg.type === 'assistant' && msg.message?.content) {
    for (const c of msg.message.content) {
      if (c.type === 'text' && c.text.trim()) emit(job.id, { kind: 'text', text: c.text });
      else if (c.type === 'tool_use') emit(job.id, { kind: 'tool', name: c.name, input: summarizeInput(c.name, c.input) });
    }
    return;
  }
  if (msg.type === 'user' && Array.isArray(msg.message?.content)) {
    for (const c of msg.message.content) {
      if (c.type !== 'tool_result') continue;
      const text = Array.isArray(c.content) ? c.content.map(x => x.text || '').join('\n') : String(c.content ?? '');
      emit(job.id, { kind: 'tool_result', isError: !!c.is_error, text: text.slice(0, 1500) });
    }
    return;
  }
  if (msg.type === 'result') {
    const text = msg.result || '';
    const reports = [...new Set(text.match(/(?:[A-Za-z]:[\\/]|[\w.-]+[\\/])[^\s`"'<>|*?()\[\]]*?\.html/g) || [])]
      .map(p => path.resolve(REPO_ROOT, p))
      .filter(p => p.startsWith(REPO_ROOT + path.sep) && fs.existsSync(p))
      .map(p => ({ path: p, href: '/repo/' + path.relative(REPO_ROOT, p).split(path.sep).map(encodeURIComponent).join('/') }));
    job.result = { text, isError: !!msg.is_error, costUsd: msg.total_cost_usd, durationMs: msg.duration_ms, turns: msg.num_turns, reports };
    saveJob(job);
    return emit(job.id, { kind: 'result', ...job.result });
  }
}

function summarizeInput(name, input = {}) {
  if (name === 'Bash' || name === 'PowerShell') return input.description || String(input.command || '').slice(0, 200);
  if (input.file_path) return input.file_path;
  if (input.pattern) return input.pattern;
  if (input.url) return input.url;
  if (input.description) return input.description;
  return JSON.stringify(input).slice(0, 200);
}

// ---------- runner ----------
function enqueue(id) {
  queue.push(id);
  setStatus(jobs.get(id), 'queued', { position: queue.length });
  pump();
}

function pump() {
  if (running || !queue.length) return;
  const id = queue.shift();
  const job = jobs.get(id);
  if (!job || job.status === 'cancelled') return pump();

  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--permission-mode', job.permissionMode];
  if (job.model) args.push('--model', job.model);
  if (job.pendingFollowUp && job.sessionId) args.push('--resume', job.sessionId);
  const prompt = job.pendingFollowUp || fs.readFileSync(path.join(jobDir(id), 'prompt.md'), 'utf8');
  job.pendingFollowUp = null;

  // Every arg above is whitelisted or a Claude-issued session UUID, so shell:true
  // (needed for the npm .cmd shim on Windows) is safe. The prompt goes through stdin.
  const child = spawn('claude', args, { cwd: REPO_ROOT, shell: process.platform === 'win32', env: process.env });
  running = { id, child };
  setStatus(job, 'running', { startedAt: new Date().toISOString(), position: 0 });
  emit(id, { kind: 'cmd', text: `claude ${args.join(' ')}` });

  child.stdin.on('error', () => {});
  child.stdin.end(prompt);

  let buf = '';
  child.stdout.on('data', d => {
    buf += d.toString('utf8');
    let nl;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (line) handleStreamLine(job, line);
    }
  });
  child.stderr.on('data', d => emit(id, { kind: 'stderr', text: d.toString('utf8') }));
  child.on('error', err => emit(id, { kind: 'stderr', text: `Failed to start claude: ${err.message}` }));
  child.on('close', code => {
    if (buf.trim()) handleStreamLine(job, buf.trim());
    running = null;
    if (job.status !== 'cancelled') {
      setStatus(job, code === 0 && !job.result?.isError ? 'done' : 'failed', { exitCode: code, endedAt: new Date().toISOString() });
    }
    pump();
  });
}

function cancel(job) {
  const qi = queue.indexOf(job.id);
  if (qi >= 0) queue.splice(qi, 1);
  if (running?.id === job.id) {
    const pid = running.child.pid;
    // Kill the whole tree: claude spawns Playwright/browsers underneath.
    if (process.platform === 'win32') execFile('taskkill', ['/PID', String(pid), '/T', '/F'], () => {});
    else running.child.kill('SIGTERM');
  }
  setStatus(job, 'cancelled', { endedAt: new Date().toISOString() });
}

// ---------- validation ----------
function cleanForm(body) {
  const s = (v, max = 20000) => String(v ?? '').slice(0, max).trim();
  const form = {
    client: s(body.client, 100),
    ticket: s(body.ticket, 100),
    testName: s(body.testName, 300),
    runType: ['new', 'retest', 'prelaunch'].includes(body.runType) ? body.runType : 'new',
    platform: s(body.platform, 50),
    experimentId: s(body.experimentId, 200),
    controlUrl: s(body.controlUrl, 3000),
    variations: (Array.isArray(body.variations) ? body.variations : [])
      .map(v => ({ label: s(v.label, 50), url: s(v.url, 3000) })).filter(v => v.url).slice(0, 10),
    figma: s(body.figma, 3000),
    codePaths: s(body.codePaths, 3000),
    details: s(body.details, 50000),
    goals: s(body.goals, 10000),
    previousBugs: s(body.previousBugs, 20000),
    browsers: (Array.isArray(body.browsers) ? body.browsers : []).map(b => s(b, 60)).slice(0, 10),
    viewports: s(body.viewports, 500),
    publishArtifact: !!body.publishArtifact,
    updateKb: !!body.updateKb,
    commit: !!body.commit,
  };
  const errors = [];
  if (!form.ticket) errors.push('Ticket ID is required.');
  if (!form.controlUrl && !form.variations.length) errors.push('Add at least one URL.');
  if (!form.details) errors.push('Test details are required.');
  if (!form.browsers.length) errors.push('Pick at least one browser.');
  const permissionMode = PERMISSION_MODES.includes(body.permissionMode) ? body.permissionMode : 'auto';
  const model = MODELS.includes(body.model) ? body.model : '';
  return { form, permissionMode, model, errors };
}

// ---------- http ----------
function sendJson(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 2e6) req.destroy(); });
    req.on('end', () => { try { resolve(JSON.parse(data || '{}')); } catch (e) { reject(e); } });
    req.on('error', reject);
  });
}

function listClients() {
  try {
    return fs.readdirSync(KB_DIR, { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('_')).map(d => d.name).sort();
  } catch { return []; }
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.md': 'text/plain; charset=utf-8' };

function serveFile(res, file) {
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(buf);
  });
}

const server = http.createServer(async (req, res) => {
  // Block cross-site requests: only the launcher page itself may call the API.
  const origin = req.headers.origin;
  if (origin && !/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) { res.writeHead(403); return res.end(); }

  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;
  try {
    if (req.method === 'GET' && (p === '/' || p === '/index.html')) return serveFile(res, path.join(PUBLIC_DIR, 'index.html'));

    if (req.method === 'GET' && p === '/api/clients') return sendJson(res, 200, listClients());

    if (req.method === 'GET' && p === '/api/jobs') {
      const list = [...jobs.values()].sort((a, b) => b.id.localeCompare(a.id))
        .map(({ id, status, form, createdAt, result, position }) => ({ id, status, ticket: form.ticket, client: form.client, createdAt, position, costUsd: result?.costUsd }));
      return sendJson(res, 200, list);
    }

    if (req.method === 'POST' && p === '/api/preview') {
      const { form, errors } = cleanForm(await readBody(req));
      return sendJson(res, 200, { prompt: buildPrompt(form, REPO_ROOT), errors });
    }

    if (req.method === 'POST' && p === '/api/jobs') {
      const { form, permissionMode, model, errors } = cleanForm(await readBody(req));
      if (errors.length) return sendJson(res, 400, { errors });
      const id = newId(form);
      fs.mkdirSync(jobDir(id), { recursive: true });
      fs.writeFileSync(path.join(jobDir(id), 'prompt.md'), buildPrompt(form, REPO_ROOT));
      const job = { id, form, permissionMode, model, status: 'new', createdAt: new Date().toISOString() };
      jobs.set(id, job);
      saveJob(job);
      enqueue(id);
      return sendJson(res, 201, { id });
    }

    const m = p.match(/^\/api\/jobs\/([\w-]+)(?:\/(\w+))?$/);
    if (m) {
      const job = jobs.get(m[1]);
      if (!job) return sendJson(res, 404, { error: 'No such job' });
      const action = m[2];

      if (req.method === 'GET' && !action) return sendJson(res, 200, job);

      if (req.method === 'GET' && action === 'prompt') return serveFile(res, path.join(jobDir(job.id), 'prompt.md'));

      if (req.method === 'GET' && action === 'events') {
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
        const f = path.join(jobDir(job.id), 'events.ndjson');
        if (fs.existsSync(f)) for (const line of fs.readFileSync(f, 'utf8').split('\n')) if (line) res.write(`data: ${line}\n\n`);
        res.write(`data: ${JSON.stringify({ kind: 'status', status: job.status, replayed: true })}\n\n`);
        if (!listeners.has(job.id)) listeners.set(job.id, new Set());
        listeners.get(job.id).add(res);
        const ping = setInterval(() => res.write(': ping\n\n'), 25000);
        req.on('close', () => { clearInterval(ping); listeners.get(job.id)?.delete(res); });
        return;
      }

      if (req.method === 'POST' && action === 'cancel') {
        if (['running', 'queued'].includes(job.status)) cancel(job);
        return sendJson(res, 200, { ok: true });
      }

      if (req.method === 'POST' && action === 'rerun') {
        if (['running', 'queued'].includes(job.status)) return sendJson(res, 409, { error: 'Job is still active' });
        job.result = null;
        emit(job.id, { kind: 'divider', text: 'Re-run from the original prompt' });
        enqueue(job.id);
        return sendJson(res, 200, { ok: true });
      }

      if (req.method === 'POST' && action === 'followup') {
        if (['running', 'queued'].includes(job.status)) return sendJson(res, 409, { error: 'Job is still active' });
        if (!job.sessionId) return sendJson(res, 409, { error: 'This job has no Claude session to continue' });
        const { message } = await readBody(req);
        const text = String(message || '').trim().slice(0, 20000);
        if (!text) return sendJson(res, 400, { error: 'Message is empty' });
        job.pendingFollowUp = text;
        emit(job.id, { kind: 'followup', text });
        enqueue(job.id);
        return sendJson(res, 200, { ok: true });
      }
    }

    // Open a generated report (only files inside the repo). Served under /repo/<relative path>
    // so the report's relative screenshot links resolve too.
    if (req.method === 'GET' && p.startsWith('/repo/')) {
      const target = path.resolve(REPO_ROOT, decodeURIComponent(p.slice('/repo/'.length)));
      if (!target.startsWith(REPO_ROOT + path.sep)) { res.writeHead(403); return res.end('Outside repo'); }
      return serveFile(res, target);
    }

    res.writeHead(404); res.end('Not found');
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
});

loadJobs();
server.listen(PORT, '127.0.0.1', () => {
  console.log(`QA Launcher running at http://localhost:${PORT}`);
  console.log(`Repo root: ${REPO_ROOT}`);
});
