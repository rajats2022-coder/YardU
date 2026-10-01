import {chromium,browserPath,requireBrowserQA} from './browser-runtime.mjs';
requireBrowserQA();
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),evidence=resolve(root,'../evidence');
await mkdir(evidence,{recursive:true});
const browser=await chromium.launch({executablePath:browserPath});
const results=[],errors=[],unexpectedSubmissions=[];
const record=(name,detail={})=>{results.push({name,passed:true,...detail});console.log('PASS '+name);};
const base='http://localhost:4319';
try{
 const desktop=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});
 const page=await desktop.newPage();page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(!['GET','HEAD'].includes(request.method()))unexpectedSubmissions.push(request.url());});
 await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 const layout=await page.evaluate(()=>{const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return{x:r.x,right:r.right,center:r.y+r.height/2};};return{whyCopy:box('.why-grid>div'),whyImage:box('.why-grid img'),conversionCopy:box('.conversion-grid>div'),conversionImage:box('.conversion-grid img')};});assert.ok(layout.whyImage.x>layout.whyCopy.right);assert.ok(Math.abs(layout.whyImage.center-layout.whyCopy.center)<1);assert.ok(layout.conversionCopy.x>layout.conversionImage.right);assert.ok(Math.abs(layout.conversionImage.center-layout.conversionCopy.center)<1);record('Purpose and conversion sections pair their photos and copy in desktop columns');
 const menu=page.locator('.service-disclosure'),summary=menu.locator('summary'),sub=menu.locator('.services-menu');
 for(let i=0;i<3;i++){
  await summary.hover();await page.waitForFunction(()=>document.querySelector('.service-disclosure').open);
  assert.equal(await summary.getAttribute('aria-expanded'),'true');
  const summaryBox=await summary.boundingBox(),subBox=await sub.boundingBox();
  await page.mouse.move(summaryBox.x+summaryBox.width/2,summaryBox.y+summaryBox.height-1);
  await page.mouse.move(subBox.x+40,subBox.y+15,{steps:12});
  assert.equal(await menu.evaluate(el=>el.open),true);
  await page.mouse.move(20,700);await page.waitForFunction(()=>!document.querySelector('.service-disclosure').open);
 }
 record('Desktop hover opens; pointer crosses into submenu; repeated leave closes');
 await summary.hover();await summary.click();assert.equal(await menu.evaluate(el=>el.open),false);await summary.click();assert.equal(await menu.evaluate(el=>el.open),true);await summary.press('Escape');assert.equal(await menu.evaluate(el=>el.open),false);record('Click toggle and Escape');
 await summary.focus();await summary.press('Enter');await summary.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')),'/services-2/');assert.equal(await menu.evaluate(el=>el.open),true);
 await page.locator('.desktop-nav a[href="/our-mission/"]').focus();assert.equal(await menu.evaluate(el=>el.open),false);record('Keyboard entry, submenu Tab, focus-out closure');
 await page.mouse.move(20,700);await summary.hover();await sub.locator('a[href="/services/mulch-straw-rock/"]').click();await page.waitForURL(base+'/services/mulch-straw-rock/');await page.goBack({waitUntil:'networkidle'});assert.equal(await menu.evaluate(el=>el.open),false);record('Service navigation and clean back navigation');
 await page.screenshot({path:resolve(evidence,'yardu-final-desktop-home.jpg'),type:'jpeg',quality:88});
 await summary.hover();await page.screenshot({path:resolve(evidence,'yardu-final-desktop-dropdown.jpg'),type:'jpeg',quality:88});
 const menuOverflow=await sub.evaluate(el=>el.scrollWidth>el.clientWidth);assert.equal(menuOverflow,false);record('Dropdown text wraps with no internal clipping');await page.mouse.move(20,700);
 await summary.press('Escape');await page.goto(base+'/#reviews',{waitUntil:'networkidle'});await page.locator('#reviews').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'start'}));await page.waitForTimeout(150);await page.screenshot({path:resolve(evidence,'yardu-final-desktop-reviews.jpg'),type:'jpeg',quality:88});
 await page.getByRole('button',{name:'Next testimonial',exact:true}).click();await page.getByText('Testimonial 2 of 2',{exact:true}).waitFor();record('Testimonial controls');
 await page.goto(base+'/service-areas/#service-area',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.querySelector('[data-area-map]').classList.contains('is-map-loaded'),{},{timeout:30000});
 assert.equal(await page.locator('.maplibregl-marker').count(),6);
 await page.getByRole('button',{name:'Explore Cary',exact:true}).click();await page.getByRole('heading',{name:'Cary, NC',exact:true}).waitFor();
 await page.getByRole('button',{name:'North Carolina',exact:true}).click();assert.equal(await page.locator('[data-map-view="state"]').getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Triangle',exact:true}).click();await page.screenshot({path:resolve(evidence,'yardu-final-desktop-map.jpg'),type:'jpeg',quality:88});record('Loaded public map, six town centers, city selection, state/Triangle controls');
 const mobile=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});const phone=await mobile.newPage();phone.on('pageerror',error=>errors.push(error.message));phone.on('request',request=>{if(!['GET','HEAD'].includes(request.method()))unexpectedSubmissions.push(request.url());});
 await phone.goto(base,{waitUntil:'networkidle'});await phone.evaluate(()=>document.fonts.ready);assert.equal(await phone.evaluate(()=>document.fonts.check('700 42px Poppins')&&document.fonts.check('400 16px Poppins')),true);await phone.screenshot({path:resolve(evidence,'yardu-final-mobile-home.jpg'),type:'jpeg',quality:88});
 await phone.getByRole('button',{name:'Open menu',exact:true}).tap();const mobileSummary=phone.locator('.mobile-menu summary');await mobileSummary.tap();assert.equal(await phone.locator('.mobile-menu details').evaluate(el=>el.open),true);await mobileSummary.tap();assert.equal(await phone.locator('.mobile-menu details').evaluate(el=>el.open),false);await mobileSummary.tap();await phone.screenshot({path:resolve(evidence,'yardu-final-mobile-menu.jpg'),type:'jpeg',quality:88});
 await phone.locator('.mobile-menu nav > a').last().press('Tab');assert.equal(await phone.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Close menu');await phone.getByRole('button',{name:'Close menu',exact:true}).press('Shift+Tab');assert.equal(await phone.evaluate(()=>document.activeElement.textContent),'Service Area');await phone.locator('.mobile-menu nav > a').last().press('Escape');assert.equal(await phone.locator('.mobile-menu').getAttribute('hidden'),'');record('Touch Services toggle, focus containment, Escape');await phone.locator('.yardu-chat-launcher').click();assert.equal(await phone.locator('#yardu-chat-panel').getAttribute('hidden'),null);assert.equal(await phone.locator('#yardu-chat-message').isDisabled(),false);assert.equal(await phone.evaluate(()=>document.activeElement.className),'yardu-chat-close');await phone.locator('.yardu-chat-close').press('Escape');assert.equal(await phone.locator('#yardu-chat-panel').getAttribute('hidden'),'');assert.equal(await phone.evaluate(()=>document.activeElement.className),'yardu-chat-launcher');record('Chat guide open/close/Escape/focus return; service questions enabled');
 await phone.goto(base+'/getestimate/',{waitUntil:'networkidle'});await phone.getByRole('button',{name:'Preview estimate request',exact:true}).click();assert.equal(await phone.locator('[aria-invalid="true"]').count(),5);assert.equal(await phone.evaluate(()=>document.activeElement.id),'name');
 await phone.getByLabel('Full name',{exact:true}).fill('Preview Test');await phone.getByLabel('Phone',{exact:true}).fill('9195550100');await phone.getByLabel('Email',{exact:true}).fill('preview@example.invalid');await phone.getByLabel('Property city',{exact:true}).fill('Cary');await phone.getByLabel('What do you need?',{exact:true}).selectOption('The YardU Special');await phone.getByRole('button',{name:'Preview estimate request',exact:true}).click();assert.match(await phone.locator('#form-status').textContent(),/Nothing has been sent or saved/);assert.equal(await phone.evaluate(()=>document.activeElement.id),'form-status');await phone.screenshot({path:resolve(evidence,'yardu-final-mobile-form.jpg'),type:'jpeg',quality:88});record('Empty and valid fake form validation; no submission');
 const manifest=JSON.parse(await readFile(resolve(root,'route-manifest.json'),'utf8'));
 for(const width of [320,390,768,960,1280,1440]){
  await page.setViewportSize({width,height:900});
  for(const route of manifest.routes.filter(r=>r.path!=='/404/')){
   await page.goto(base+route.path,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);
   const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll('h1').length,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)}));assert.equal(state.overflow,false,`${width} ${route.path} overflow`);assert.equal(state.h1,1);assert.deepEqual(state.broken,[]);
  }record('All '+(manifest.routes.length-1)+' substantive pages at '+width+'px');
 }
 assert.deepEqual(errors,[]);assert.deepEqual(unexpectedSubmissions,[]);record('No page exceptions or non-GET/HEAD requests');
 await writeFile(resolve(evidence,'final-browser-results.json'),JSON.stringify({status:'passed',runner:'existing Playwright + existing Chromium headless shell, isolated contexts',results,errors,unexpectedSubmissions},null,2));
 console.log('Browser QA passed.');
}finally{await browser.close();}
