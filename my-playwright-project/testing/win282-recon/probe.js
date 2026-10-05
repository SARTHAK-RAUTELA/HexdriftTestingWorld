const pw = require('D:/Installed-apps-files/Github/Git_repos/HexdriftTestingWorld/my-playwright-project/node_modules/playwright');
const [dev,arm]=process.argv.slice(2);
const url='https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro282mode&_conv_eforce=100350640.'+(arm==='control'?'1003184723':'1003184724');
(async()=>{
 const eng=dev.startsWith('iPhone')?pw.webkit:pw.chromium;
 const b=await eng.launch(); const ctx=await b.newContext({...pw.devices[dev]});
 const p=await ctx.newPage(); await p.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));
 const t0=Date.now();
 await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 let prev={};
 for(let i=0;i<14;i++){
  const snap=await p.evaluate(()=>{const o={};document.querySelectorAll('main > *, main [id^=shopify-section], body > [id^=shopify-section]').forEach(e=>{if(e.id)o[e.id]=Math.round(e.getBoundingClientRect().height)});
   const tr=document.querySelector('#shopify-section-shop-the-winkbed-warranty');o.__trialTop=tr?Math.round(tr.getBoundingClientRect().top+scrollY):null;
   const loc=[...document.querySelectorAll('h2,h3')].find(h=>/Try The WinkBed In Person/i.test(h.textContent)); if(loc){let s=loc;while(s.parentElement&&!/^shopify-section|^cre/.test(s.id||''))s=s.parentElement; o.__locSection=(s.id||s.className)+' h='+Math.round(s.getBoundingClientRect().height)+' top='+Math.round(s.getBoundingClientRect().top+scrollY);}
   o.__docH=document.documentElement.scrollHeight; return o;});
  const ch=Object.keys(snap).filter(k=>prev[k]!==undefined&&prev[k]!==snap[k]&&!k.startsWith('__')).map(k=>k.replace('shopify-section-','')+':'+prev[k]+'→'+snap[k]);
  console.log(((Date.now()-t0)/1000).toFixed(1)+'s','trialTop='+snap.__trialTop,'docH='+snap.__docH,'loc='+snap.__locSection,ch.join(' | '));
  prev=snap;
  // mimic a user scrolling a bit
  if(i===6) await p.evaluate(()=>window.scrollTo(0,2800));
  await p.waitForTimeout(1500);
 }
 await b.close();})();
