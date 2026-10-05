const pw = require('D:/Installed-apps-files/Github/Git_repos/HexdriftTestingWorld/my-playwright-project/node_modules/playwright');
const [dev,which]=process.argv.slice(2);
const URLS={variation:'https://www.winkbeds.com/pages/shop-winkbed?utm_campaign=Cro282mode&_conv_eforce=100350640.1003184724',plain:'https://www.winkbeds.com/pages/shop-winkbed'};
(async()=>{
 const eng=dev.startsWith('iPhone')?pw.webkit:pw.chromium;
 const b=await eng.launch(); const ctx=await b.newContext({...pw.devices[dev]});
 const p=await ctx.newPage();
 await p.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});
   window.__maxY=0; addEventListener('scroll',()=>{window.__maxY=Math.max(window.__maxY,scrollY)},{passive:true});
   document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='#shopify-section-timedModal{display:none!important}';document.head.appendChild(s)});});
 const t0=Date.now();
 await p.goto(URLS[which],{waitUntil:'domcontentloaded',timeout:60000});
 const tl=(Date.now()-t0)/1000;
 let seen=null;
 for(let i=0;i<40;i++){
  const st=await p.evaluate(()=>{const s=document.querySelector('.cre-t-248-section');return {has:!!s,h:s?Math.round(s.getBoundingClientRect().height):0,y:Math.round(scrollY),maxY:window.__maxY,body248:[...document.body.classList].filter(c=>/248/.test(c)).join(' '),has282:!!document.querySelector('.cre-t-282-container')}});
  if(st.has&&!seen){seen=((Date.now()-t0)/1000).toFixed(1); console.log(dev,which,'goto',tl+'s','248 section appeared at',seen+'s','scrollY',st.y,'maxScrollSoFar',st.maxY,'h',st.h,'bodyCls',st.body248,'282grid',st.has282);}
  if(seen&&st.has282) break;
  await p.waitForTimeout(500);
 }
 if(!seen){console.log(dev,which,'248 section NOT present after 20s with no scroll');}
 if(which==='variation'&&seen){
  await p.evaluate(()=>document.querySelector('.cre-t-282-container').scrollIntoView({block:'center'})); await p.waitForTimeout(600);
  await p.evaluate(()=>document.querySelector('[data-cre-target=showrooms] p').click());
  const s=[];for(let i=0;i<20;i++){await p.waitForTimeout(500);s.push(await p.evaluate(()=>Math.round(scrollY)))}
  const r=await p.evaluate(()=>{const hdr=document.querySelector('header.site-header').getBoundingClientRect().bottom;const sec=document.querySelector('.cre-t-248-section');const h=[...sec.querySelectorAll('h1,h2,h3')][0];return {headTop:h?Math.round(h.getBoundingClientRect().top-hdr):null,head:h&&h.textContent.trim().slice(0,40)}});
  console.log(dev,'showrooms early tap (',((Date.now()-t0)/1000).toFixed(1),'s ) samples',s.join(','),JSON.stringify(r));
  await p.screenshot({path:`C:/Users/SARTHA~1/AppData/Local/Temp/claude/D--Installed-apps-files-Github-Git-repos-HexdriftTestingWorld/899a68da-ef21-4d10-9b28-2d43607c17b8/scratchpad/w282/w248_${dev.replace(/\W+/g,'_')}.png`});
 }
 await b.close();})();
