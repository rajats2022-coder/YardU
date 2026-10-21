import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium,browserPath,requireBrowserQA} from './browser-runtime.mjs';
requireBrowserQA();
const base=process.env.YARDU_QA_BASE||'http://localhost:4321';
const out=resolve('qa/guides');await mkdir(out,{recursive:true});
const paths=['/guides/','/guides/lawn-care-costs-raleigh/','/guides/choosing-mowing-service-raleigh/','/services/lawn-maintenance/','/guides/raleigh-leaf-collection-fall-2026/','/services/leaf-debris-removal/'];
const browser=await chromium.launch({executablePath:browserPath});
const results=[],errors=[],outbound=[];
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},bypassCSP:true});
 await context.route('https://**',route=>route.abort());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))outbound.push(r.url());});
 for(const width of [1440,1024,768,390,320]){
  await page.setViewportSize({width,height:1000});
  for(const path of paths){
   const response=await page.goto(base+path,{waitUntil:'networkidle'});assert.equal(response.status(),200);
   await page.evaluate(()=>document.fonts.ready);await page.addScriptTag({path:resolve('node_modules/axe-core/axe.min.js')});
   const state=await page.evaluate(async()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,h1:document.querySelectorAll('main h1').length,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),violations:(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))}));
   results.push({width,path,...state});assert.equal(state.overflow,false,`${width} ${path}: overflow`);assert.equal(state.h1,1);assert.deepEqual(state.broken,[]);assert.deepEqual(state.violations,[],`${width} ${path}: accessibility`);
   if([1440,390].includes(width)&&path.startsWith('/guides/'))await page.screenshot({path:resolve(out,`${path==='/guides/'?'index':path.split('/')[2]}-${width}.png`),fullPage:true});
  }
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base+'/guides/');await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.locator('#mobile-menu').getByRole('link',{name:'Guides',exact:true}).click();assert.equal(await page.locator('#mobile-menu').isVisible(),false);
 await page.locator('.guide-card').first().click();assert.match(page.url(),/lawn-care-costs-raleigh/);await page.locator('.guide-aside nav a').first().click();assert.ok(page.url().includes('#start-with-what-each-visit-includes'));
 await page.locator('.guide-related a').first().click();assert.match(page.url(),/choosing-mowing-service-raleigh/);
 await page.goto(base+'/services/lawn-maintenance/');await page.locator('.guide-promo .guide-card').first().click();assert.match(page.url(),/lawn-care-costs-raleigh/);
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'/guides/');assert.equal(await page.locator('.guide-card').first().evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
 await page.getByRole('link',{name:'Skip to content',exact:true}).focus();assert.equal(await page.getByRole('link',{name:'Skip to content',exact:true}).evaluate(el=>el===document.activeElement),true);
 assert.deepEqual(errors,[]);assert.deepEqual(outbound,[]);
 await writeFile(resolve(out,'results.json'),JSON.stringify({results,interactions:'mobile menu, index → article, table of contents, sibling article, lawn service → article, reduced motion, keyboard focus',errors,outbound},null,2));
 console.log(`Guide browser QA passed: ${results.length} page/viewport audits; no accessibility violations, horizontal overflow, missing images, page errors or submissions.`);
}finally{await browser.close();}
