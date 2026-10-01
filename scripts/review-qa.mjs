import {chromium,browserPath,requireBrowserQA} from './browser-runtime.mjs';requireBrowserQA();
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),evidence=resolve(root,'../evidence');
const browser=await chromium.launch({executablePath:browserPath});const results=[],violations=[],errors=[];
try{
 const page=await browser.newPage({viewport:{width:1280,height:900},bypassCSP:true});page.on('pageerror',error=>errors.push(error.message));
 const audit=async(name)=>{const data=await page.evaluate(async()=>axe.run(document.querySelector('#reviews')));for(const item of data.violations)violations.push({state:name,id:item.id,nodes:item.nodes});};
 const geometry=async(name)=>{const rects=await page.locator('[data-review-card].is-active').evaluate(card=>{const bounds=card.getBoundingClientRect(),quote=card.querySelector('blockquote').getBoundingClientRect(),footer=card.querySelector('footer').getBoundingClientRect(),last=card.querySelector('.review-google-link').getBoundingClientRect();return{quoteBottom:quote.bottom,authorTop:footer.top,lastBottom:last.bottom,cardBottom:bounds.bottom};});assert.ok(rects.authorTop>=rects.quoteBottom+8,name+': author stays after quote');assert.ok(rects.lastBottom<=rects.cardBottom-8,name+': actions stay in card');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,name+': no horizontal overflow');results.push({name,...rects});};
 for(const width of [320,390,768,960,1280,1440]){
  await page.setViewportSize({width,height:900});await page.goto('http://localhost:4319/reviews/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.addScriptTag({path:resolve(root,'node_modules/axe-core/axe.min.js')});
  await geometry(`${width} real excerpt`);await audit(`${width} real excerpt`);
  const expand=page.locator('[data-review-card].is-active .review-expand');if(await expand.count()){await expand.click();await page.waitForTimeout(80);await geometry(`${width} full quote`);assert.equal(await expand.getAttribute('aria-expanded'),'true');await audit(`${width} full quote`);await expand.press('Enter');assert.equal(await expand.getAttribute('aria-expanded'),'false');}
  await page.locator('.stack-review-next').press('Enter');await page.waitForTimeout(80);await geometry(`${width} next review`);await page.locator('.stack-review-prev').press('Enter');await page.waitForTimeout(80);await geometry(`${width} previous review`);
  assert.equal(await page.locator('[data-review-card][aria-hidden="true"] a:not([tabindex="-1"])').count(),0);
  if([1280,390].includes(width)){await page.locator('#reviews').evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-120,behavior:'instant'}));await page.screenshot({path:resolve(evidence,`yardu-reviews-fixed-${width===1280?'desktop':'mobile'}.jpg`),type:'jpeg',quality:90,fullPage:false});}
 }
 let fixture=await readFile(resolve(root,'dist/reviews/index.html'),'utf8');
 fixture=fixture.replace(/<blockquote>.*?<\/blockquote>/g,'<blockquote>'+Array(160).fill('A long synthetic review checks wrapping and normal document flow.').join(' ')+'</blockquote>').replace('<strong>DJ Burns</strong>','<strong>Alexandria Example Reviewer With A Very Long Display Name To Check Wrapping</strong>');
 await page.route('http://localhost:4319/reviews/',route=>route.fulfill({status:200,contentType:'text/html',body:fixture}));
 for(const width of [320,390,768,960,1280,1440]){
  await page.setViewportSize({width,height:900});await page.goto('http://localhost:4319/reviews/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.addScriptTag({path:resolve(root,'node_modules/axe-core/axe.min.js')});await geometry(`${width} synthetic long name/excerpt`);await page.locator('[data-review-card].is-active .review-expand').click();await page.waitForTimeout(80);await geometry(`${width} synthetic long name/full review`);await audit(`${width} synthetic full review`);await page.locator('.stack-review-next').press('Enter');await page.waitForTimeout(80);await geometry(`${width} synthetic next`);
 }
 await writeFile(resolve(root,'qa/review-results.json'),JSON.stringify({status:violations.length||errors.length?'failed':'passed',realAndSyntheticStates:results.length,results,violations,errors,method:'Real quotes plus long-name/160-sentence synthetic fixture injected only into isolated browser responses; fixture is never part of website data. All six widths, expand/collapse and keyboard next/previous.',source:'Website testimonials remain distinct from verified Google profile/aggregate; no new Google quote fabricated'},null,2)+'\n');
 assert.deepEqual(errors,[]);assert.equal(violations.length,0);console.log(JSON.stringify({status:'passed',states:results.length,axeViolations:0,widths:[320,390,768,960,1280,1440]}));
}finally{await browser.close();}
