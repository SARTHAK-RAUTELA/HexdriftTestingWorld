const { webkit, chromium, firefox } = require('@playwright/test');
const eng={webkit,chromium,firefox}[process.argv[2]||'webkit'];
(async()=>{const b=await eng.launch();const out=[];
for(let i=0;i<4;i++){const ctx=await b.newContext({viewport:{width:1366,height:900}});const p=await ctx.newPage();
await p.goto('https://buckfirelaw.com/case-types/personal-injury/autism-abuse/?cro_mode=qa&_conv_eforce=100053058.1000257876',{waitUntil:'domcontentloaded',timeout:90000});
await p.waitForTimeout(10000);
out.push(await p.evaluate(()=>{const c=document.querySelector('.buckfire-24-story-card'); if(!c) return 'nocard';
 const chain=[];let e=c.parentElement;while(e&&e.id!=='sidebar-main'){chain.push(e.tagName+'.'+String(e.className).slice(0,40)+' disp='+getComputedStyle(e).display);e=e.parentElement;}
 const sm=document.querySelector('#sidebar-main');
 return {t27:document.body.classList.contains('cre-t-27'), w:Math.round(c.getBoundingClientRect().width), chain, kids:[...sm.children].map(k=>String(k.className).slice(0,40)+'('+getComputedStyle(k).display+')').slice(0,6)};}));
if(i===0) await p.locator('#sidebar-main').screenshot({path:'../../qa-knowledge-base/buckfirelaw/buckfire-test24-results/shots/'+(process.argv[2]||'webkit')+'-cre-t-27-sidebar.png'}).catch(()=>{});
await ctx.close();}
console.log(JSON.stringify(out,null,1));await b.close();})();
