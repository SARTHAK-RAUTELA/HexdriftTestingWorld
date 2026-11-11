const { chromium } = require('@playwright/test'); const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('https://buckfirelaw.com/case-types/personal-injury/?cro_mode=qa&_conv_eforce=100053058.1000257876',{waitUntil:'domcontentloaded',timeout:90000});
await p.waitForTimeout(6000);
const ch=await p.evaluate(()=>{const a=Object.values(window.convert.data.experiences);const e=a.find(x=>String(x.id)==='100053058');return {v:e.variations.find(x=>x.id==='1000257876').changes, c:e.variations.find(x=>x.id==='1000257875').changes, gjs:e.global_js||null, gcss:e.global_css||null};});
fs.writeFileSync('deployed.json',JSON.stringify(ch,null,1));
for(const c of ch.v){ if(c.data&&c.data.js) fs.writeFileSync('deployed.js',c.data.js); if(c.data&&c.data.css) fs.writeFileSync('deployed.css',c.data.css);}
console.log('control changes',JSON.stringify(ch.c).slice(0,300)); console.log('types',ch.v.map(c=>c.type+':'+Object.keys(c.data||{})));
await b.close();})();
