const pw = require('D:/Installed-apps-files/Github/Git_repos/HexdriftTestingWorld/my-playwright-project/node_modules/playwright');
const fs=require('fs');
const [arm,dev,out,keysArg,reps]=process.argv.slice(2);
const url='https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro282mode&_conv_eforce=100350640.'+(arm==='control'?'1003184723':'1003184724');
const HEAD={trial:'Our 120-Night, Risk-Free',warranty:'Our lifetime durability promise',usa:'Before Your WinkBed Arrives',rating:'What Real Winkbed Owners Say',shipping:'Can I return or exchange',showrooms:'Try The WinkBed In Person'};
const keys=keysArg.split(','); const res=[];
(async()=>{
 const eng=dev.startsWith('iPhone')?pw.webkit:pw.chromium;
 const b=await eng.launch();
 for(let rep=1;rep<=+reps;rep++) for(const k of keys){
 const ctx=await b.newContext({...pw.devices[dev]});
 const p=await ctx.newPage(); await p.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));
 const logs=[],errs=[]; p.on('console',m=>{if(/Benefit clicked|Conversion|No matching/i.test(m.text()))logs.push(m.text())}); p.on('pageerror',e=>{if(/282/.test(e.stack||''))errs.push(e.message)});
 const row={dev,arm,k,rep};
 try{
  await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
  await p.waitForSelector('.cre-t-282-container',{timeout:30000}); await p.waitForTimeout(5000);
  await p.evaluate(()=>{document.querySelectorAll('button').forEach(b=>{if(/OK, GOT IT/i.test(b.textContent)&&b.offsetParent)b.click()})});
  await p.evaluate(()=>document.querySelector('.cre-t-282-container').scrollIntoView({block:'center'})); await p.waitForTimeout(1500);
  await p.evaluate(()=>{document.querySelectorAll('button').forEach(b=>{if(/OK, GOT IT/i.test(b.textContent)&&b.offsetParent)b.click()})});
  row.y0=await p.evaluate(()=>Math.round(scrollY));
  const pt=await p.evaluate((k)=>{const r=document.querySelector('.cre-t-282-container [data-cre-target="'+k+'"] p').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}},k); row.hit=await p.evaluate(({x,y})=>{const h=document.elementFromPoint(x,y);return h&&h.closest('.cre-t-282-container')?'ok':(h?h.tagName+'.'+h.className:'none')},pt); if(process.env.DOMCLICK){await p.evaluate((k)=>document.querySelector('.cre-t-282-container [data-cre-target="'+k+'"] p').click(),k);} else await p.touchscreen.tap(pt.x,pt.y);
  const samples=[]; for(let i=0;i<10;i++){await p.waitForTimeout(400); samples.push(await p.evaluate(()=>Math.round(scrollY)));}
  Object.assign(row,await p.evaluate((txt)=>{
   const hdr=document.querySelector('header.site-header').getBoundingClientRect().bottom;
   const cands=[...document.querySelectorAll('h1,h2,h3,h4,p,span,div,button,a')].filter(e=>e.offsetParent!==null&&e.textContent.trim().toLowerCase().startsWith(txt.toLowerCase())&&e.getBoundingClientRect().height>0);
   cands.sort((a,b)=>a.textContent.length-b.textContent.length);
   const h=cands[0]; const r=h?h.getBoundingClientRect():null;
   const ret=[...document.querySelectorAll('#faq-content .concertina')].find(c=>/can i return or exchange/i.test(c.innerText));
   return {hdr:Math.round(hdr),headTop:r?Math.round(r.top-hdr):null,headVisible:r?(r.top>=hdr-2&&r.bottom<=innerHeight-100):false,faqOpen:ret.classList.contains('concertina--open'),vh:innerHeight};
  },HEAD[k]));
  row.samples=samples; row.moved=samples[samples.length-1]!==row.y0; row.drift=samples[9]-samples[5];
  row.logs=logs; row.errs=errs;
  await p.screenshot({path:`${out}/L_${dev.replace(/\W+/g,'_')}_${arm}_${k}_${rep}.png`});
 }catch(e){row.err=e.message.split('\n')[0]}
 console.log(JSON.stringify(row)); res.push(row);
 await ctx.close();}
 fs.writeFileSync(`${out}/land_${dev.replace(/\W+/g,'_')}_${arm}.json`,JSON.stringify(res,null,1));
 await b.close();})();
