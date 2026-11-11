const { chromium } = require('@playwright/test');
(async()=>{const b=await chromium.launch();
for(let i=0;i<5;i++){const ctx=await b.newContext({viewport:{width:1366,height:900}});const p=await ctx.newPage();
await p.goto('https://buckfirelaw.com/case-types/personal-injury/?cro_mode=qa&utm_campaign=cre_qa&_conv_eforce=100053058.1000257876,100052509.1000256557',{waitUntil:'domcontentloaded',timeout:90000});
await p.waitForTimeout(9000);
const ok=await p.evaluate(()=>{const a=document.querySelector('.buckfire-24-story-card'),b=document.querySelector('.testimonial-card');return a&&b&&a.getBoundingClientRect().width>0&&b.getBoundingClientRect().width>0;});
if(ok){await p.locator('#sidebar-main').screenshot({path:'../../qa-knowledge-base/buckfirelaw/buckfire-test24-results/shots/desktop-chromium-double-card-509-plus-24.png'});console.log('captured on try',i);await ctx.close();break;}
await ctx.close();}
await b.close();})();
