const pw = require('D:/Installed-apps-files/Github/Git_repos/HexdriftTestingWorld/my-playwright-project/node_modules/playwright');
const out=process.argv[2];
const U='https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro282mode&_conv_eforce=100350640.';
const HIDE='#shopify-section-timedModal,.retention-popup{display:none!important}';
(async()=>{
 const b=await pw.chromium.launch();
 const mk=async(w)=>{const ctx=await b.newContext({...pw.devices['Pixel 5'],viewport:{width:w,height:800}});const p=await ctx.newPage();await p.addInitScript((css)=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=css;document.head.appendChild(s)})},HIDE);return [ctx,p]};
 for(const [arm,id] of [['control','1003184723'],['variation','1003184724']]) for(const w of [320,360]){
  const [ctx,p]=await mk(w); await p.goto(U+id,{waitUntil:'domcontentloaded',timeout:60000}); await p.waitForSelector('.cre-t-282-container'); await p.waitForTimeout(6000);
  await p.evaluate(()=>document.querySelector('.cre-t-282-container').scrollIntoView({block:'center'})); await p.waitForTimeout(800);
  const m=await p.evaluate(()=>{const c=document.querySelector('.cre-t-282-container');const cr=c.getBoundingClientRect();const cs=getComputedStyle(c);return {cL:Math.round(cr.left),cW:Math.round(cr.width),cols:cs.gridTemplateColumns,gap:cs.columnGap,pad:cs.padding,itemsMaxW:getComputedStyle(c.querySelector('.benefit-content-inside')).maxWidth,parentW:Math.round(c.parentElement.getBoundingClientRect().width),parentCls:c.parentElement.className}});
  console.log(arm,'w='+w,JSON.stringify(m)); await p.screenshot({path:`${out}/${arm}_w${w}.png`}); await ctx.close();}
 {const [ctx,p]=await mk(393); await p.goto(U+'1003184724',{waitUntil:'domcontentloaded',timeout:60000}); await p.waitForSelector('.cre-t-282-container'); await p.waitForTimeout(12000);
  const had=await p.evaluate(()=>{const s=document.querySelector('.cre-t-248-section');if(s)s.remove();return !!s});
  await p.evaluate(()=>document.querySelector('.cre-t-282-container').scrollIntoView({block:'center'})); await p.waitForTimeout(1000);
  await p.evaluate(()=>document.querySelector('[data-cre-target=showrooms] p').click()); await p.waitForTimeout(4000);
  const r=await p.evaluate(()=>{const hdr=document.querySelector('header.site-header').getBoundingClientRect().bottom;const e=document.elementFromPoint(innerWidth/2,hdr+60);const s=e&&e.closest('[id^=shopify-section]');return {sectionAtTop:s&&s.id,text:(e&&e.innerText||'').replace(/\s+/g,' ').slice(0,80)}});
  console.log('NO-248 showrooms had248=',had,JSON.stringify(r)); await p.screenshot({path:out+'/no248_showrooms.png'}); await ctx.close();}
 await b.close();})();
