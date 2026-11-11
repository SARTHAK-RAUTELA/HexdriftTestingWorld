const { firefox, webkit } = require('@playwright/test');
(async()=>{for (const [n,e] of [['firefox',firefox],['webkit',webkit]]) {
const b=await e.launch(); const ctx=await b.newContext({viewport:{width:1366,height:900}});
const p=await ctx.newPage();
try{
await p.goto('https://buckfirelaw.com/case-types/personal-injury/autism-abuse/?cro_mode=qa&_conv_eforce=100053058.1000257876',{waitUntil:'domcontentloaded',timeout:90000});
await p.waitForTimeout(12000);
const o=await p.evaluate(()=>({body:document.body.className.split(' ').filter(x=>/Buckfire|cre-t/.test(x)).join(' '),cards:document.querySelectorAll('.buckfire-24-story-card').length,sm:document.querySelectorAll('#sidebar-main').length,
 smRects:[...document.querySelectorAll('#sidebar-main')].map(e=>{const r=e.getBoundingClientRect();return Math.round(r.width)+'x'+Math.round(r.height)+' disp='+getComputedStyle(e).display+' parent='+e.parentElement.className.slice(0,50)}),
 visibleCards:[...document.querySelectorAll('.buckfire-24-story-card')].map(e=>e.getBoundingClientRect().width),
 forms:[...document.querySelectorAll('.sidebar_form')].map(e=>Math.round(e.getBoundingClientRect().width)+' in#sidebar-main='+!!e.closest('#sidebar-main')),
 conv:!!window.convert, ua:navigator.userAgent.slice(0,80)}));
console.log(n,JSON.stringify(o,null,1)); await p.screenshot({path:'../../qa-knowledge-base/buckfirelaw/buckfire-test24-results/shots/desktop-'+n+'-probe.png'});
}catch(err){console.log(n,'ERR',String(err).slice(0,200));}
await b.close();}})();
