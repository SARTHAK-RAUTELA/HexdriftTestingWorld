const pw = require('D:/Installed-apps-files/Github/Git_repos/HexdriftTestingWorld/my-playwright-project/node_modules/playwright');
const [dev,out]=process.argv.slice(2);
(async()=>{
 const eng=dev.startsWith('iPhone')?pw.webkit:pw.chromium;
 const b=await eng.launch(); const ctx=await b.newContext({...pw.devices[dev]});
 const p=await ctx.newPage(); await p.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));
 const logs=[]; p.on('console',m=>{if(/Benefit clicked|Conversion|No matching/i.test(m.text()))logs.push(m.text())});
 await p.goto('https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro282mode&_conv_eforce=100350640.1003184723',{waitUntil:'domcontentloaded',timeout:60000});
 await p.waitForSelector('.cre-t-282-container',{timeout:30000}); await p.waitForTimeout(5000);
 const info=await p.evaluate(()=>{const c=document.querySelector('.cre-t-282-container');return {html:c.outerHTML.slice(0,300),items:[...c.querySelectorAll('.benefit-content-inside')].map(i=>i.className+' | '+i.innerText.trim())}});
 console.log(JSON.stringify(info,null,1));
 const n=await p.evaluate(()=>document.querySelectorAll('.cre-t-282-container .benefit-content-inside').length);
 for(let i=0;i<n;i++){
  await p.evaluate(()=>document.querySelector('.cre-t-282-container').scrollIntoView({block:'center'})); await p.waitForTimeout(1200);
  const y0=await p.evaluate(()=>Math.round(scrollY)); const k=logs.length;
  await p.evaluate((i)=>document.querySelectorAll('.cre-t-282-container .benefit-content-inside p')[i].click(),i);
  await p.waitForTimeout(2500);
  const y1=await p.evaluate(()=>Math.round(scrollY));
  console.log('item',i,'y0',y0,'y1',y1,'moved',Math.abs(y1-y0)>20,JSON.stringify(logs.slice(k)));
 }
 await p.evaluate(()=>document.querySelector('.cre-t-282-container').scrollIntoView({block:'center'})); await p.waitForTimeout(800);
 const el=await p.$('.cre-t-282-container'); await el.screenshot({path:out+'/'+dev.replace(/\W+/g,'_')+'_control_grid.png'});
 await b.close();})();
