import {chromium,browserPath,requireBrowserQA} from './browser-runtime.mjs';
requireBrowserQA();
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),evidence=resolve(root,'../evidence');
const axePath=process.env.YARDU_AXE_PATH||resolve(root,'node_modules/axe-core/axe.min.js');
const manifest=JSON.parse(await readFile(resolve(root,'route-manifest.json'),'utf8'));
const browser=await chromium.launch({executablePath:browserPath});
const results=[],violations=[],incomplete=[];
try{
 const context=await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1,bypassCSP:true});
 const page=await context.newPage();
 const audit=async(name)=>{
  const result=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'rule',values:['color-contrast']}}));
  const detail={name,violationCount:result.violations.reduce((n,v)=>n+v.nodes.length,0),manualReviewCount:result.incomplete.reduce((n,v)=>n+v.nodes.length,0),passes:result.passes.reduce((n,v)=>n+v.nodes.length,0)};results.push(detail);
  for(const entry of result.violations)for(const node of entry.nodes)violations.push({state:name,target:node.target,html:node.html,summary:node.failureSummary,data:node.any.map(check=>check.data)});
  for(const entry of result.incomplete)for(const node of entry.nodes)incomplete.push({state:name,target:node.target,reason:node.any.map(check=>check.message)});
  console.log(name+': '+detail.violationCount+' violations; '+detail.manualReviewCount+' manual items');
 };
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:900});
  for(const route of manifest.routes){
   await page.goto('http://localhost:4319'+route.path,{waitUntil:'networkidle'});await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(async image=>{image.loading='eager';await image.decode();}));});await page.addScriptTag({path:axePath});
   // Include image-backed text in the run; axe explicitly reports those it cannot resolve.
   await audit(width+' '+route.path+' default');
  }
 }
 await page.setViewportSize({width:1280,height:900});await page.goto('http://localhost:4319/',{waitUntil:'networkidle'});await page.addScriptTag({path:axePath});
 await page.locator('.yardu-chat-launcher').click();await audit('desktop verified guide open');await page.locator('.yardu-chat-close').press('Escape');
 await page.locator('.service-disclosure summary').hover();await audit('desktop Services hover open');await page.locator('.services-menu a').first().hover();await audit('desktop dropdown item hover');
 await page.locator('.service-disclosure summary').press('Escape');await page.mouse.move(20,700);
 for(const selector of ['.nav-actions .button','.home-hero .button-primary','.home-hero .button-ghost-light','.trust-card','.additional-services .service-card','.process .accordion summary','.review-cta-row .button-navy','#estimate-form button']){
  const target=page.locator(selector).first();await target.hover();await page.waitForTimeout(400);await audit('hover '+selector);await target.focus();await page.waitForTimeout(400);await audit('focus '+selector);
 }
 await page.locator('#estimate-form button').evaluate(el=>el.disabled=true);await audit('disabled preview button');await page.locator('#estimate-form button').evaluate(el=>el.disabled=false);await page.locator('#estimate-form button').click();await audit('invalid estimate form errors/status');await page.getByLabel('Full name',{exact:true}).fill('Preview Test');await page.getByLabel('Phone',{exact:true}).fill('9195550100');await page.getByLabel('Email',{exact:true}).fill('preview@example.invalid');await page.getByLabel('Property city',{exact:true}).fill('Cary');await page.getByLabel('What do you need?',{exact:true}).selectOption('The YardU Special');await page.locator('#estimate-form button').click();await audit('valid disconnected form status');
 const headingColors=await page.locator('.additional-services .section-heading').evaluate(el=>{const h=el.querySelector('h2'),p=el.querySelector('p:last-child'),section=el.closest('section');return {heading:getComputedStyle(h).color,copy:getComputedStyle(p).color,background:getComputedStyle(section).backgroundColor};});assert.equal(headingColors.heading,'rgb(255, 255, 255)');assert.equal(headingColors.background,'rgb(7, 7, 7)');results.push({name:'Readable service headings: white text on the requested black service section',passed:true,...headingColors});
 const caption=await page.locator('.process-caption span').evaluate(el=>({color:getComputedStyle(el).color,spacing:getComputedStyle(el).letterSpacing,background:getComputedStyle(el.parentElement).backgroundColor}));assert.equal(caption.color,'rgb(255, 255, 255)');results.push({name:'Photo caption regression: white label, restrained spacing and dark backing',passed:true,...caption});
 await page.evaluate(async()=>{await Promise.all([...document.images].map(async image=>{image.loading='eager';await image.decode();}));});await page.locator('.additional-services').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-120,behavior:'instant'}));await page.screenshot({path:resolve(evidence,'yardu-contrast-services-desktop.jpg'),type:'jpeg',quality:90});
 await page.locator('.process-visual').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-120,behavior:'instant'}));await page.screenshot({path:resolve(evidence,'yardu-contrast-caption-desktop.jpg'),type:'jpeg',quality:90});
 await page.setViewportSize({width:390,height:844});await page.goto('http://localhost:4319/',{waitUntil:'networkidle'});await page.addScriptTag({path:axePath});await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.locator('.mobile-menu summary').click();await audit('mobile menu Services open');await page.locator('.mobile-menu .button').first().focus();await audit('mobile menu CTA focus');await page.getByRole('button',{name:'Close menu',exact:true}).click();await page.locator('.yardu-chat-launcher').click();await audit('mobile verified guide open');await page.locator('.yardu-chat-close').press('Escape');
 await page.evaluate(async()=>{await Promise.all([...document.images].map(async image=>{image.loading='eager';await image.decode();}));});await page.locator('.additional-services').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-100,behavior:'instant'}));await page.screenshot({path:resolve(evidence,'yardu-contrast-services-mobile.jpg'),type:'jpeg',quality:90});
 await page.locator('.process-visual').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-100,behavior:'instant'}));await page.screenshot({path:resolve(evidence,'yardu-contrast-caption-mobile.jpg'),type:'jpeg',quality:90});
 const output={status:violations.length?'failed':'automated checks passed; manual image review required',runner:'axe-core 4.13.0 color-contrast in authorized isolated Playwright contexts',results,violations,incomplete,limitations:'Image, gradient, transparency and overlapping card cases can be incomplete. These must be reviewed in screenshots; this report is not a complete accessibility certification.'};
 await writeFile(resolve(root,'qa/contrast-results.json'),JSON.stringify(output,null,2)+'\n');
 assert.equal(violations.length,0,'Rendered contrast violations; inspect qa/contrast-results.json');
}finally{await browser.close();}
