import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {chromium,browserPath} from './browser-runtime.mjs';
import {newlyConfirmedServices} from './new-services.mjs';
const base='http://localhost:4327',root=new URL('../',import.meta.url),evidence=new URL('../qa/services-oct8/',import.meta.url);
await mkdir(evidence,{recursive:true});
const browser=await chromium.launch({executablePath:browserPath});
const errors=[],nonGET=[],results=[];
try{
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))nonGET.push(r.url());});
 await page.emulateMedia({reducedMotion:'reduce'});
 const manifest=JSON.parse(await readFile(new URL('route-manifest.json',root),'utf8'));
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:900});
  for(const route of manifest.routes.filter(r=>r.path!=='/404/')){
   const response=await page.goto(base+route.path,{waitUntil:'networkidle'});assert.equal(response.status(),200);
   await page.evaluate(()=>document.fonts.ready);
   const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,h1:document.querySelectorAll('h1').length,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}));
   assert.equal(state.overflow,false,`${width} ${route.path} viewport fit`);assert.equal(state.h1,1);assert.deepEqual(state.broken,[]);
  }
  for(const path of ['/','/services-2/']){
   await page.goto(base+path,{waitUntil:'networkidle'});
   const cards=page.locator('.service-card');assert.equal(await cards.count(),path==='/'?12:16);
   for(const service of newlyConfirmedServices){
    const card=page.locator(`.service-card[href="/services/${service.slug}/"]`);await card.scrollIntoViewIfNeeded();await card.locator('img').evaluate(async img=>{img.loading='eager';await img.decode();});
    const state=await card.evaluate(e=>{const c=e.getBoundingClientRect(),h=e.querySelector('h3').getBoundingClientRect(),p=e.querySelector('p').getBoundingClientRect();return {left:c.left,right:c.right,headingBottom:h.bottom,copyTop:p.top,copyBottom:p.bottom,bottom:c.bottom};});
    assert.ok(state.left>=-1&&state.right<=width+1);assert.ok(state.copyTop>=state.headingBottom);assert.ok(state.copyBottom<=state.bottom);
   }
  }
  results.push({width,all30SubstantivePagesFit:true,allNewCardsFit:true});
 }
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:900});
  for(const service of newlyConfirmedServices){
   await page.goto(base+`/services/${service.slug}/`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(()=>Promise.all([...document.images].map(async img=>{img.loading='eager';await img.decode();})));
   await page.screenshot({path:new URL(`${service.slug}-${width}.jpg`,evidence).pathname,type:'jpeg',quality:82,fullPage:true});
  }
  await page.goto(base+'/services-2/',{waitUntil:'networkidle'});const firstNew=page.locator('.service-card[href="/services/plant-installs/"]');await firstNew.scrollIntoViewIfNeeded();await page.locator('.service-card img').evaluateAll(images=>Promise.all(images.map(async img=>{img.loading='eager';await img.decode();}))); 
  await page.screenshot({path:new URL(`service-hub-${width}.jpg`,evidence).pathname,type:'jpeg',quality:85});
 }
 await page.setViewportSize({width:1280,height:900});await page.goto(base,{waitUntil:'networkidle'});
 const menu=page.locator('.service-disclosure');await menu.locator('summary').focus();await menu.locator('summary').press('Enter');
 for(const service of newlyConfirmedServices){const a=menu.locator(`a[href="/services/${service.slug}/"]`);await a.focus();assert.ok(await a.isVisible());assert.equal(await a.textContent(),service.nav+service.short);}
 await menu.locator('a[href="/services/snow-removal/"]').click();await page.waitForURL(base+'/services/snow-removal/');
 await page.goto(base,{waitUntil:'networkidle'});await menu.locator('summary').hover();await menu.locator('a[href="/services/snow-removal/"]').scrollIntoViewIfNeeded();await page.screenshot({path:new URL('desktop-services-menu.jpg',evidence).pathname,type:'jpeg',quality:85});
 results.push({desktopKeyboardMenu:true,lastServiceNavigation:true});
 const mobileContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await mobileContext.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());const phone=await mobileContext.newPage();
 phone.on('pageerror',e=>errors.push(e.message));phone.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))nonGET.push(r.url());});
 for(const service of newlyConfirmedServices){
  await phone.goto(base,{waitUntil:'networkidle'});await phone.getByRole('button',{name:'Open menu',exact:true}).tap();await phone.locator('.mobile-menu summary').tap();
  const a=phone.locator(`.mobile-menu a[href="/services/${service.slug}/"]`);await a.scrollIntoViewIfNeeded();assert.ok(await a.isVisible());
  if(service.slug==='snow-removal')await phone.screenshot({path:new URL('mobile-services-menu.jpg',evidence).pathname,type:'jpeg',quality:85});
  await a.tap();await phone.waitForURL(base+`/services/${service.slug}/`);assert.ok((await phone.locator('h1').textContent()).startsWith(service.name));
 }
 await phone.goto(base+'/getestimate/',{waitUntil:'networkidle'});assert.equal(await phone.locator('#homeworks-request-form').getAttribute('src'),'https://secure.copilotcrm.com/client/guest/requests/embedNew/93604580-7d65-4275-8638-95088dcb20c6');
 assert.deepEqual(errors,[]);assert.deepEqual(nonGET,[]);results.push({mobileAllFiveLinksNavigate:true,existingCRMEmbedRetained:true,formSubmissions:0});
 const report={status:'passed',runner:'Existing isolated Playwright Chromium on the Mac; cached browser, no install',results,errors,nonGET,limitations:'External requests blocked, including CRM iframe. No forms submitted. Chromium mobile emulation; no actual iPhone/Safari device test. Original newer working tree remains unreadable and must be reconciled before publication.'};
 await writeFile(new URL('results.json',evidence),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}
