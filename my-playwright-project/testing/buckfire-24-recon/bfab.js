const { chromium } = require('@playwright/test');
(async()=>{const b=await chromium.launch();
for(let i=0;i<6;i++){const ctx=await b.newContext({viewport:{width:1366,height:900}});const p=await ctx.newPage();
await p.goto('https://buckfirelaw.com/case-types/personal-injury/autism-abuse/?cro_mode=qa&_conv_eforce=100053058.1000257876',{waitUntil:'domcontentloaded',timeout:90000});
await p.waitForTimeout(9000);
const o=await p.evaluate(()=>{const ls=Object.keys(localStorage).filter(k=>/ab|quiz|bf/i.test(k)).map(k=>k+'='+localStorage.getItem(k).slice(0,40));
 const ck=document.cookie.split(';').map(s=>s.trim()).filter(s=>/ab|quiz|bf/i.test(s));
 const quizShown=getComputedStyle(document.querySelector('.bf-ab-quiz-form')).display!=='none';
 const scr=[...document.scripts].map(s=>s.textContent).find(t=>t.includes('bf-ab-quiz-form'));
 return {quizShown, cardW:Math.round(document.querySelector('.buckfire-24-story-card').getBoundingClientRect().width), ls, ck, script: scr? scr.slice(0,700):null};});
console.log(JSON.stringify(o));
if(o.quizShown && !global.shot){global.shot=1; await p.locator('#sidebar-main').screenshot({path:'../../qa-knowledge-base/buckfirelaw/buckfire-test24-results/shots/desktop-chromium-quiz-arm-card-hidden.png'});
 await p.screenshot({path:'../../qa-knowledge-base/buckfirelaw/buckfire-test24-results/shots/desktop-chromium-quiz-arm-viewport.png'});}
await ctx.close();}
await b.close();})();
