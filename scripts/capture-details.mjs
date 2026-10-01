import {chromium,browserPath,requireBrowserQA} from './browser-runtime.mjs';
requireBrowserQA();
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const evidence=resolve(import.meta.dirname,'../../evidence'),base='http://localhost:4319';
const browser=await chromium.launch({executablePath:browserPath});
try{
 const context=await browser.newContext({viewport:{width:1280,height:900},deviceScaleFactor:1});const page=await context.newPage();
 for(const width of [320,390,768,960,1280,1440]){
  await page.setViewportSize({width,height:900});await page.goto(base,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  const state=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,imageHeight:document.querySelector('.home-hero-image').getBoundingClientRect().height,pictureHeight:document.querySelector('.home-hero-visual').getBoundingClientRect().height}));
  assert.equal(state.overflow,false);if(width<=760)assert.ok(state.imageHeight<=state.pictureHeight,'Mobile image fits photo frame and permits real object-fit crop');
 }
 await page.setViewportSize({width:1280,height:800});await page.goto(base,{waitUntil:'networkidle'});
 await page.screenshot({path:resolve(evidence,'yardu-final-desktop-home.jpg'),type:'jpeg',quality:88});await page.locator('.service-disclosure summary').hover();await page.screenshot({path:resolve(evidence,'yardu-final-desktop-dropdown.jpg'),type:'jpeg',quality:88});await page.locator('.service-disclosure summary').press('Escape');await page.mouse.move(20,700);
 for(let y=0;y<await page.evaluate(()=>document.documentElement.scrollHeight);y+=700){await page.evaluate(top=>scrollTo({top,behavior:'instant'}),y);await page.waitForTimeout(80);}
 await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(200);await page.screenshot({path:resolve(evidence,'yardu-final-desktop-full.jpg'),type:'jpeg',quality:85,fullPage:true});
 await page.setViewportSize({width:1280,height:1400});await page.goto(base+'/reviews/',{waitUntil:'networkidle'});await page.locator('#reviews').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-120,behavior:'instant'}));await page.screenshot({path:resolve(evidence,'yardu-final-review-section.jpg'),type:'jpeg',quality:88});await page.setViewportSize({width:1280,height:800});
 await page.goto(base+'/service-areas/#service-area',{waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('[data-area-map]').classList.contains('is-map-loaded'));await page.getByRole('button',{name:'Explore Cary',exact:true}).click();await page.screenshot({path:resolve(evidence,'yardu-final-desktop-map.jpg'),type:'jpeg',quality:88});
 await page.goto(base+'/services/leaf-debris-removal/',{waitUntil:'networkidle'});await page.screenshot({path:resolve(evidence,'yardu-final-leaf-service.jpg'),type:'jpeg',quality:88});
 await page.goto(base+'/service-areas/fuquay-varina/',{waitUntil:'networkidle'});await page.getByRole('heading',{name:'Leaf removal in Fuquay-Varina',exact:true}).evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-120,behavior:'instant'}));await page.screenshot({path:resolve(evidence,'yardu-final-fuquay-leaf.jpg'),type:'jpeg',quality:88});
 const phone=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});await phone.goto(base,{waitUntil:'networkidle'});await phone.evaluate(()=>document.fonts.ready);await phone.screenshot({path:resolve(evidence,'yardu-final-mobile-home.jpg'),type:'jpeg',quality:88});
 await phone.getByRole('button',{name:'Open menu',exact:true}).tap();await phone.locator('.mobile-menu summary').tap();await phone.screenshot({path:resolve(evidence,'yardu-final-mobile-menu.jpg'),type:'jpeg',quality:88});
 const results=JSON.parse(await readFile(resolve(evidence,'final-browser-results.json'),'utf8'));results.results=results.results.filter(r=>!r.name.startsWith('Final mobile image')&&!r.name.startsWith('Full homepage'));results.results.push({name:'Final mobile image frame crop + homepage six-width recheck after CSS correction',passed:true},{name:'Full homepage, complete review section, leaf service and Fuquay cleanup context captured',passed:true});await writeFile(resolve(evidence,'final-browser-results.json'),JSON.stringify(results,null,2)+'\n');
 console.log('Final photo geometry, six homepage widths and supplemental captures passed.');
}finally{await browser.close();}
