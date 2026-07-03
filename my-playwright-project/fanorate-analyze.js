const fs = require('fs');
const path = require('path');

const results = JSON.parse(fs.readFileSync(path.join(__dirname, 'fanorate-data', 'page-results.json'), 'utf-8'));

const report = [];

for (const r of results) {
  const pageReport = {
    key: r.key, name: r.name, url: r.url, httpStatus: r.httpStatus, title: r.title,
    ok: r.ok, error: r.error,
    consoleErrorCount: (r.consoleErrors || []).length,
    consoleErrorsSample: (r.consoleErrors || []).slice(0, 5),
    failedRequests: r.failedRequests || [],
  };

  // Image analysis
  const brokenImages = [];
  const stretchedImages = [];
  const missingAltImages = [];
  const seenSrc = new Set();
  for (const img of (r.images || [])) {
    if (seenSrc.has(img.src)) continue; // dedupe repeated images (e.g. logo in header+footer)
    seenSrc.add(img.src);
    if (!img.complete || (img.naturalWidth === 0 && img.naturalHeight === 0)) {
      brokenImages.push(img);
      continue;
    }
    if (img.displayWidth > 0 && img.displayHeight > 0 && img.naturalWidth > 0 && img.naturalHeight > 0) {
      const naturalRatio = img.naturalWidth / img.naturalHeight;
      const displayRatio = img.displayWidth / img.displayHeight;
      const pctDiff = Math.abs(naturalRatio - displayRatio) / naturalRatio * 100;
      // object-fit cover/contain intentionally changes visual crop but doesn't stretch; only flag if object-fit is 'fill' or none and ratio differs significantly
      if (pctDiff > 15 && img.objectFit !== 'cover' && img.objectFit !== 'contain') {
        stretchedImages.push({ ...img, pctDiff: pctDiff.toFixed(1) });
      }
    }
    if (!img.alt || img.alt.trim() === '') {
      missingAltImages.push(img);
    }
  }
  pageReport.totalImages = (r.images || []).length;
  pageReport.uniqueImages = seenSrc.size;
  pageReport.brokenImages = brokenImages;
  pageReport.stretchedImages = stretchedImages;
  pageReport.missingAltCount = missingAltImages.length;

  // Link analysis
  const badLinkPatterns = (r.links || []).filter(l => {
    const h = l.href || '';
    return h === '#' || h === '' || h.startsWith('javascript:void(0)') || h === 'javascript:;';
  });
  pageReport.totalLinks = (r.links || []).length;
  pageReport.emptyOrHashLinks = badLinkPatterns.map(l => ({ text: l.text, href: l.href, className: l.className }));

  // CTA-like links/buttons
  const ctaLinks = (r.links || []).filter(l => l.isCTA || /read more|view|preview|analysis|see all|subscribe|sign up|join|watch|book|buy|explore/i.test(l.text));
  pageReport.ctaSample = ctaLinks.slice(0, 15).map(l => ({ text: l.text, href: l.absoluteHref }));
  pageReport.buttonCount = (r.buttons || []).length;
  pageReport.buttons = r.buttons || [];

  report.push(pageReport);
}

fs.writeFileSync(path.join(__dirname, 'fanorate-data', 'analysis-summary.json'), JSON.stringify(report, null, 2));

// Print condensed summary to console
for (const p of report) {
  console.log(`\n=== ${p.name} (${p.url}) ===`);
  console.log(`HTTP: ${p.httpStatus} | Title: ${p.title}`);
  console.log(`Images: ${p.totalImages} total, ${p.uniqueImages} unique | Broken: ${p.brokenImages.length} | Stretched: ${p.stretchedImages.length} | Missing alt: ${p.missingAltCount}`);
  console.log(`Links: ${p.totalLinks} total | Empty/hash: ${p.emptyOrHashLinks.length}`);
  console.log(`Console errors: ${p.consoleErrorCount} | Failed requests: ${p.failedRequests.length}`);
  if (p.brokenImages.length) console.log('BROKEN IMAGES:', JSON.stringify(p.brokenImages.map(i=>i.src), null, 2));
  if (p.stretchedImages.length) console.log('STRETCHED IMAGES:', JSON.stringify(p.stretchedImages, null, 2));
  if (p.emptyOrHashLinks.length) console.log('EMPTY/HASH LINKS:', JSON.stringify(p.emptyOrHashLinks, null, 2));
  if (p.failedRequests.length) console.log('FAILED REQUESTS:', JSON.stringify(p.failedRequests, null, 2));
}
