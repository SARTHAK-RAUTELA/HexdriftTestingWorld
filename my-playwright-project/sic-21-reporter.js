'use strict';
const fs   = require('fs');
const path = require('path');

class SIC21Reporter {
  constructor(options) {
    this.results   = [];
    this.startTime = Date.now();
    this.outputFile = options && options.outputFile
      ? options.outputFile
      : path.resolve(__dirname, 'sic-21-qa-report.html');
  }

  onBegin(_config, suite) {
    console.log(`\n[SIC-21 Reporter] ${suite.allTests().length} tests collected\n`);
  }

  onTestEnd(test, result) {
    const screenshots = [];
    for (const att of result.attachments || []) {
      if (att.contentType && att.contentType.startsWith('image/')) {
        try {
          const buf = att.body || (att.path && fs.existsSync(att.path) ? fs.readFileSync(att.path) : null);
          if (buf) screenshots.push('data:' + att.contentType + ';base64,' + Buffer.from(buf).toString('base64'));
        } catch (_) {}
      }
    }
    const titlePath = test.titlePath ? test.titlePath() : [test.title];
    const suitePath = titlePath.slice(0, -1).filter(Boolean);
    this.results.push({
      title:    test.title,
      suitePath,
      project:  test.parent && test.parent.project ? test.parent.project.name : '',
      status:   result.status,
      duration: result.duration || 0,
      errorMsg: result.error ? String(result.error.message || result.error).substring(0, 800) : null,
      screenshots,
      retry:    result.retry || 0,
    });
  }

  async onEnd() {
    fs.writeFileSync(this.outputFile, this._buildHTML(), 'utf8');
    console.log(`\n[SIC-21 Reporter] Report saved → ${path.relative(process.cwd(), this.outputFile)}\n`);
  }

  _buildHTML() {
    const passed  = this.results.filter(r => r.status === 'passed').length;
    const failed  = this.results.filter(r => r.status === 'failed' || r.status === 'timedOut').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const total   = this.results.length;
    const secs    = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const runDate = new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' });

    const groups = {};
    for (const r of this.results) {
      const key = r.suitePath[0] || 'Ungrouped';
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    }

    const groupsHTML = Object.entries(groups).map(([suite, tests]) => {
      const gPass = tests.filter(t => t.status === 'passed').length;
      const gFail = tests.filter(t => t.status !== 'passed' && t.status !== 'skipped').length;
      const gCls  = gFail > 0 ? 'fail' : 'pass';

      const testsHTML = tests.map(t => {
        const cls  = t.status === 'passed' ? 'pass' : t.status === 'skipped' ? 'skip' : 'fail';
        const icon = t.status === 'passed' ? '✓' : t.status === 'skipped' ? '—' : '✗';
        const dur  = (t.duration / 1000).toFixed(2);
        const proj = t.project ? `<span class="badge">${esc(t.project)}</span>` : '';
        const retry = t.retry > 0 ? `<span class="retry-badge">retry ${t.retry}</span>` : '';
        const errDiv = t.errorMsg ? `<div class="err"><pre>${esc(t.errorMsg)}</pre></div>` : '';
        const ssDiv  = t.screenshots.length
          ? `<div class="ss-row">${t.screenshots.map((s, i) =>
              `<a href="${s}" target="_blank"><img src="${s}" alt="screenshot ${i+1}" loading="lazy" title="Click to open full size"></a>`
            ).join('')}</div>` : '';
        const sub = t.suitePath.slice(1).join(' › ');
        const subDiv = sub ? `<span class="sub">${esc(sub)}</span>` : '';

        return `
<div class="tr ${cls}" data-status="${cls}">
  <div class="tr-head">
    <span class="icon">${icon}</span>
    <span class="tname">${subDiv}${esc(t.title)}</span>
    <span class="meta">${proj}${retry}<span class="dur">${dur}s</span></span>
  </div>
  ${errDiv}${ssDiv}
</div>`;
      }).join('');

      return `
<section class="group ${gCls}">
  <div class="group-head" onclick="toggle(this)">
    <span class="arrow">▶</span>
    <strong>${esc(suite)}</strong>
    <span class="gstat">
      <span class="c-pass">✓ ${gPass}</span>
      ${gFail > 0 ? `<span class="c-fail">✗ ${gFail}</span>` : ''}
    </span>
  </div>
  <div class="group-body">${testsHTML}</div>
</section>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SIC-21 QA Report — 13Sick Step 4 Clinic Validation</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#f0f2f5;color:#172b4d}
header{background:linear-gradient(135deg,#0052cc 0%,#0065ff 100%);color:#fff;padding:24px 36px}
header h1{font-size:22px;font-weight:700;margin-bottom:6px}
header .meta{font-size:13px;opacity:.85}
header .meta span{background:rgba(255,255,255,.18);border-radius:12px;padding:2px 10px;margin-right:8px;font-size:12px}
.summary{display:flex;gap:14px;padding:18px 36px;background:#fff;border-bottom:1px solid #dfe1e6;flex-wrap:wrap;align-items:stretch}
.stat{border-radius:8px;padding:12px 22px;min-width:110px;text-align:center;flex:1}
.stat .n{font-size:30px;font-weight:700;line-height:1.1}
.stat .l{font-size:11px;opacity:.7;text-transform:uppercase;letter-spacing:.06em;margin-top:2px}
.stat.all{background:#ebecf0;color:#344563}
.stat.ok{background:#e3fcef;color:#006644}
.stat.ng{background:#ffebe6;color:#bf2600}
.stat.sk{background:#fffae6;color:#7a5c00}
.stat.tm{background:#f4f5f7;color:#344563}
.info-bar{background:#fff;border-bottom:1px solid #dfe1e6;padding:10px 36px;font-size:12px;color:#6b778c;display:flex;gap:20px;flex-wrap:wrap}
.info-bar strong{color:#344563}
.filters{padding:12px 36px;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.filters button{border:1px solid #dfe1e6;background:#fff;border-radius:4px;padding:6px 16px;cursor:pointer;font-size:13px;transition:.15s}
.filters button:hover{background:#f4f5f7}
.filters button.active{background:#0052cc;color:#fff;border-color:#0052cc}
main{padding:16px 36px 48px}
.group{margin-bottom:10px;border-radius:8px;overflow:hidden;border:1px solid #dfe1e6;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.group.fail>.group-head{border-left:4px solid #de350b}
.group.pass>.group-head{border-left:4px solid #00875a}
.group-head{display:flex;align-items:center;gap:10px;padding:12px 18px;cursor:pointer;user-select:none;background:#fafbfc}
.group-head:hover{background:#f1f2f4}
.arrow{font-size:10px;transition:transform .2s;color:#6b778c;display:inline-block}
.group-head.open .arrow{transform:rotate(90deg)}
.gstat{margin-left:auto;display:flex;gap:12px;font-size:13px}
.c-pass{color:#00875a;font-weight:600}.c-fail{color:#de350b;font-weight:600}
.group-body{display:none;border-top:1px solid #f1f2f4}
.group-body.open{display:block}
.tr{border-top:1px solid #f4f5f7;padding:10px 18px}
.tr.pass{background:#fff}
.tr.fail{background:#fffbfb}
.tr.skip{background:#fffdf0;opacity:.8}
.tr-head{display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap}
.icon{font-size:16px;flex-shrink:0;margin-top:1px}
.tr.pass .icon{color:#00875a}.tr.fail .icon{color:#de350b}.tr.skip .icon{color:#856404}
.tname{flex:1;font-size:13px;word-break:break-word}
.sub{font-size:11px;color:#6b778c;display:block;margin-bottom:2px}
.meta{display:flex;align-items:center;gap:6px;flex-shrink:0;font-size:12px;margin-top:1px}
.badge{background:#dfe1e6;border-radius:3px;padding:2px 7px;font-size:11px;white-space:nowrap}
.retry-badge{background:#ffe380;border-radius:3px;padding:2px 7px;font-size:11px}
.dur{color:#97a0af}
.err{margin-top:8px}
.err pre{background:#fff0ee;border:1px solid #ffd2cc;border-radius:5px;padding:10px 14px;font-size:12px;overflow-x:auto;white-space:pre-wrap;word-break:break-word;color:#bf2600;line-height:1.5}
.ss-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px;padding-top:8px;border-top:1px solid #f4f5f7}
.ss-row img{max-width:260px;max-height:200px;border:1px solid #dfe1e6;border-radius:6px;cursor:zoom-in;object-fit:contain;background:#f4f5f7;transition:transform .15s;box-shadow:0 1px 4px rgba(0,0,0,.1)}
.ss-row img:hover{transform:scale(1.02);box-shadow:0 4px 12px rgba(0,0,0,.15)}
footer{text-align:center;padding:24px;font-size:12px;color:#97a0af;border-top:1px solid #dfe1e6;background:#fff;margin-top:16px}
.legend{display:flex;gap:16px;flex-wrap:wrap;font-size:12px;color:#6b778c;padding:8px 36px;background:#fff;border-bottom:1px solid #f0f0f0}
.legend-item{display:flex;align-items:center;gap:5px}
.dot{width:8px;height:8px;border-radius:50%}
.dot.pass{background:#00875a}.dot.fail{background:#de350b}.dot.skip{background:#856404}
</style>
</head>
<body>
<header>
  <h1>SIC-21 QA Report — 13Sick Telehealth Step 4 Clinic Validation</h1>
  <div class="meta">
    <span>Run: ${runDate}</span>
    <span>Duration: ${secs}s</span>
    <span>Experiment: CRE-T-21</span>
    <span>Control: vB.js (#practice-search-by-name)</span>
    <span>Variation B: js.js (#practice-search-by-postcode)</span>
  </div>
</header>

<div class="summary">
  <div class="stat all"><div class="n">${total}</div><div class="l">Total</div></div>
  <div class="stat ok"> <div class="n">${passed}</div><div class="l">Passed</div></div>
  <div class="stat ng"> <div class="n">${failed}</div><div class="l">Failed</div></div>
  <div class="stat sk"> <div class="n">${skipped}</div><div class="l">Skipped</div></div>
  <div class="stat tm"> <div class="n">${secs}s</div><div class="l">Duration</div></div>
</div>

<div class="info-bar">
  <span><strong>Control URL:</strong> _conv_eforce=100052011.1000255372</span>
  <span><strong>Variation URL:</strong> _conv_eforce=100052011.1000255373</span>
  <span><strong>Target step:</strong> body[data-telehealth="step_4_Verify"]</span>
  <span><strong>Error color:</strong> rgb(234, 72, 72)</span>
</div>

<div class="legend">
  <div class="legend-item"><div class="dot pass"></div> Passed</div>
  <div class="legend-item"><div class="dot fail"></div> Failed / Timeout</div>
  <div class="legend-item"><div class="dot skip"></div> Skipped</div>
</div>

<div class="filters">
  <button class="active" onclick="filter('all',this)">All</button>
  <button onclick="filter('pass',this)">Passed only</button>
  <button onclick="filter('fail',this)">Failed only</button>
  <button onclick="filter('skip',this)">Skipped only</button>
  <button onclick="expandAll()">Expand all</button>
  <button onclick="collapseAll()">Collapse all</button>
</div>

<main>${groupsHTML}</main>

<footer>
  SIC-21 Clinic Validation A/B Test &nbsp;·&nbsp;
  Control: vB.js &nbsp;·&nbsp; Variation B: js.js &nbsp;·&nbsp;
  Generated by sic-21-reporter.js &nbsp;·&nbsp; ${runDate}
</footer>

<script>
function toggle(h){
  h.classList.toggle('open');
  h.nextElementSibling.classList.toggle('open');
}
function filter(cls,btn){
  document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.tr').forEach(tr=>{
    if(cls==='all') tr.style.display='';
    else tr.style.display = tr.dataset.status===cls ? '' : 'none';
  });
}
function expandAll(){
  document.querySelectorAll('.group-head').forEach(h=>{
    h.classList.add('open');
    h.nextElementSibling.classList.add('open');
  });
}
function collapseAll(){
  document.querySelectorAll('.group-head').forEach(h=>{
    h.classList.remove('open');
    h.nextElementSibling.classList.remove('open');
  });
}
// Auto-expand failed groups
document.querySelectorAll('.group.fail .group-head').forEach(h=>{
  h.classList.add('open');
  h.nextElementSibling.classList.add('open');
});
</script>
</body>
</html>`;
  }
}

function esc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

module.exports = SIC21Reporter;
