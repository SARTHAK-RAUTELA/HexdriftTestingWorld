const pw = require('D:/Installed-apps-files/Github/Git_repos/HexdriftTestingWorld/my-playwright-project/node_modules/playwright');
const [arm,dev,out,keysArg]=process.argv.slice(2);
const url='https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro282mode&_conv_eforce=100350640.'+(arm==='control'?'1003184723':'1003184724');
const TARGET={trial:'#shopify-section-shop-the-winkbed-warranty',warranty:'#shopify-section-shop-promise',usa:'#shopify-section-shop-hi-touch',rating:'#shopify-section-testimonials',shipping:'#faq-content',showrooms:'#shopify-section-shop-frames'};
const seqs=keysArg.split(',').map(s=>s.split('+'));
(async()=>{
 const eng=dev.startsWith('iPhone')?pw.webkit:pw.chromium;
 const b=await eng.launch();
 for(const seq of seqs){
 const ctx=await b.newContext({...pw.devices[dev]});
 const p=await ctx.newPage(); await p.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));
 const logs=[]; p.on('console',m=>{if(/Benefit clicked|Conversion|No matching/i.test(m.text()))logs.push(m.text())});
 try{
 await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 await p.waitForSelector('.cre-t-282-container',{timeout:30000}); await p.waitForTimeout(5000);
 for(const k of seq){
  await p.evaluate(()=>{document.querySelectorAll('button').forEach(b=>{if(/OK, GOT IT/i.test(b.textContent)&&b.offsetParent)b.click()})});
  await p.evaluate(()=>window.scrollTo(0,0)); await p.waitForTimeout(400);
  await p.evaluate(()=>document.querySelector('.cre-t-282-container').scrollIntoView({block:'center'})); await p.waitForTimeout(800);
  const hit=await p.evaluate((k)=>{const e=document.querySelector('.cre-t-282-container [data-cre-target="'+k+'"] p');const r=e.getBoundingClientRect();const h=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return h&&!h.closest('.cre-t-282-container')?(h.tagName+'.'+String(h.className).slice(0,60)+' "'+(h.innerText||'').slice(0,50)+'" parent '+h.parentElement.tagName+'.'+String(h.parentElement.className).slice(0,60)):'ok'},k);
  const y0=await p.evaluate(()=>scrollY); const n=logs.length;
  await p.locator(`.cre-t-282-container [data-cre-target="${k}"] p`).tap({timeout:8000,force:true});
  // sample scroll position over time to detect jumps / smoothness
  const samples=[]; for(let i=0;i<10;i++){await p.waitForTimeout(400); samples.push(await p.evaluate(()=>Math.round(scrollY)));}
  const r=await p.evaluate(({sel})=>{
   const hdr=document.querySelector('header.site-header').getBoundingClientRect().bottom;
   const t=document.querySelector(sel); const tr=t.getBoundingClientRect();
   const ret=[...document.querySelectorAll('#faq-content .concertina')].find(c=>/can i return or exchange/i.test(c.innerText));
   const rt=ret.querySelector('.concertina__title').getBoundingClientRect();
   const kids=[...ret.children].map(c=>c.className+':'+Math.round(c.getBoundingClientRect().height));
   const active=[...document.querySelectorAll('#faq-content .faq__cat')].filter(c=>c.classList.contains('current')).map(c=>c.textContent.trim());
   const atTop=document.elementFromPoint(innerWidth/2,hdr+40); const sec=atTop&&atTop.closest('[id^=shopify-section]');
   return {hdr:Math.round(hdr),targetTop:Math.round(tr.top),faqOpen:ret.classList.contains('concertina--open'),faqTitleTop:Math.round(rt.top),faqKids:kids,faqCat:active,sectionAtTop:sec?sec.id:null,textAtTop:atTop?(atTop.innerText||'').replace(/\s+/g,' ').slice(0,60):null};
  },{sel:TARGET[k]});
  console.log(dev,arm,seq.join('+'),'->',k,JSON.stringify({hit,y0,samples,...r,logs:logs.slice(n)}));
  await p.screenshot({path:`${out}/${dev.replace(/\W+/g,'_')}_${arm}_${seq.join('+')}_${k}.png`});
 }}catch(e){console.log('ERR',seq.join('+'),e.message.split('\n')[0])}
 await ctx.close();}
 await b.close();})();
