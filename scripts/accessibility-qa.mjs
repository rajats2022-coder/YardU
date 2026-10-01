import {chromium,browserPath,requireBrowserQA} from './browser-runtime.mjs';
requireBrowserQA();
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),evidence=resolve(root,'../evidence');await mkdir(evidence,{recursive:true});
const manifest=JSON.parse(await readFile(resolve(root,'route-manifest.json'),'utf8'));
const browser=await chromium.launch({executablePath:browserPath});
const results=[],violations=[],incomplete=[],errors=[],outbound=[];
try{
 const context=await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1,bypassCSP:true});const page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(!['GET','HEAD'].includes(request.method()))outbound.push({url:request.url(),body:request.postData()});});
 const load=async(path='/')=>{await page.goto('http://localhost:4319'+path,{waitUntil:'networkidle'});await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(async image=>{image.loading='eager';await image.decode();}));});await page.addScriptTag({path:resolve(root,'node_modules/axe-core/axe.min.js')});};
 const audit=async(name)=>{
  const data=await page.evaluate(async()=>axe.run(document));
  const detail={name,violations:data.violations.reduce((n,v)=>n+v.nodes.length,0),incomplete:data.incomplete.reduce((n,v)=>n+v.nodes.length,0),passedRules:data.passes.length};results.push(detail);
  for(const entry of data.violations)for(const node of entry.nodes)violations.push({state:name,rule:entry.id,impact:entry.impact,tags:entry.tags,target:node.target,summary:node.failureSummary,help:entry.helpUrl});
  for(const entry of data.incomplete)for(const node of entry.nodes)incomplete.push({state:name,rule:entry.id,target:node.target,reason:node.any.map(check=>check.message)});
  console.log(JSON.stringify(detail));
 };
 for(const width of [1280,390]){await page.setViewportSize({width,height:900});for(const route of manifest.routes){await load(route.path);await audit(`${width} ${route.path}`);}}
 await page.setViewportSize({width:1280,height:900});await load();
 await page.locator('.service-disclosure summary').hover();await audit('desktop dropdown hover');await page.locator('.services-menu a').first().focus();await audit('desktop dropdown keyboard focus');await page.locator('.service-disclosure summary').press('Escape');await page.mouse.move(10,750);
 await page.locator('.yardu-chat-launcher').click();await audit('desktop verified guide open');
 await page.locator('#yardu-guide-form button').click();await audit('guide empty question error');
 const fakeQuestion='My name is Preview Test, email preview@example.invalid at 123 Example Street. Can you help with leaves in Cary?';
 await page.locator('#yardu-chat-message').fill(fakeQuestion);await page.locator('#yardu-guide-form button').click();await page.locator('#yardu-chat-answer:not([hidden])').waitFor();await audit('verified guide response');
 assert.match(await page.locator('[data-chat-answer]').textContent(),/Raleigh, Cary/);assert.equal(await page.locator('[data-chat-source]').textContent(),'Verified service guide');
 assert.equal(outbound.length,1);const payload=JSON.parse(outbound[0].body);assert.deepEqual(Object.keys(payload).sort(),['features','session']);assert.doesNotMatch(outbound[0].body,/Preview|example|123|name|email|address/);assert.equal(payload.features.cities[0],'cary');
 await page.locator('[data-chat-draft-toggle]').click();await audit('estimate draft fields');await page.locator('#yardu-draft-service').selectOption('Leaf & debris removal');await page.locator('#yardu-draft-town').selectOption('Cary');await page.locator('#yardu-draft-details').fill('Preview Test; preview@example.invalid; backyard leaf pile');await page.locator('#yardu-draft-form button').click();await audit('local estimate summary');assert.match(await page.locator('#yardu-draft-summary').textContent(),/Nothing has been sent or saved/);assert.equal(outbound.length,1);
 await page.screenshot({path:resolve(evidence,'yardu-guide-desktop.jpg'),type:'jpeg',quality:88});await page.locator('[data-chat-edit]').click();assert.equal(await page.locator('#yardu-draft-details').inputValue(),'Preview Test; preview@example.invalid; backyard leaf pile');await page.locator('.yardu-chat-close').press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.className),'yardu-chat-launcher');
 await load('/getestimate/');await page.locator('#estimate-form button').click();await audit('estimate form validation errors');
 await page.getByLabel('Full name',{exact:true}).fill('Preview Test');await page.getByLabel('Phone',{exact:true}).fill('9195550100');await page.getByLabel('Email',{exact:true}).fill('preview@example.invalid');await page.getByLabel('Property city',{exact:true}).fill('Cary');await page.getByLabel('What do you need?',{exact:true}).selectOption('The YardU Special');await page.locator('#estimate-form button').click();await audit('estimate form valid disconnected status');assert.equal(outbound.length,1);
 await page.setViewportSize({width:390,height:844});await load();await page.getByRole('button',{name:'Open menu',exact:true}).click();await page.locator('.mobile-menu summary').click();await audit('mobile services menu open');await page.getByRole('button',{name:'Close menu',exact:true}).click();await page.locator('.yardu-chat-launcher').click();await audit('mobile verified guide open');await page.locator('[data-chat-question]').first().click();await page.locator('#yardu-chat-answer:not([hidden])').waitFor();await audit('mobile guide response');await page.screenshot({path:resolve(evidence,'yardu-guide-mobile.jpg'),type:'jpeg',quality:88});
 for(const width of [320,390,768,1280]){await page.setViewportSize({width,height:900});const bounds=await page.locator('.yardu-chat-panel').boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width,`Chat fit ${width}`);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 assert.deepEqual(errors,[]);assert.ok(outbound.every(request=>request.url==='http://localhost:4319/api/chat'));
 await writeFile(resolve(root,'qa/accessibility-results.json'),JSON.stringify({version:'axe-core 4.13.0',time:new Date().toISOString(),scope:'All default axe rules, all 23 routes at 1280/390px, interactive menu/form/guide states; manual keyboard checks and guide 320/390/768/1280 geometry',results,violations,incomplete,errors,privacy:{requests:outbound.length,onlyFixedServiceTags:true,leadRequests:0,providerCalls:0},limitations:'Automated checks are not accessibility certification. Image/gradient contrast incomplete cases require manual review. Browser tests use fake data and isolated contexts.'},null,2)+'\n');
 assert.equal(violations.length,0,'Inspect qa/accessibility-results.json for actionable findings');
}finally{await browser.close();}
