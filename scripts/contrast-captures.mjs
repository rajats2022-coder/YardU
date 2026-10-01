import {chromium,browserPath,requireBrowserQA} from './browser-runtime.mjs';
requireBrowserQA();
import {resolve} from 'node:path';
const evidence=resolve(import.meta.dirname,'../../evidence');
const browser=await chromium.launch({executablePath:browserPath});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900},deviceScaleFactor:1,bypassCSP:true});await page.goto('http://localhost:4319/',{waitUntil:'networkidle'});await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(async img=>{img.loading='eager';await img.decode();}));});
 const capture=async(selector,name)=>{await page.locator(selector).first().evaluate(el=>scrollTo({top:scrollY+el.getBoundingClientRect().top-120,behavior:'instant'}));await page.waitForTimeout(400);await page.screenshot({path:resolve(evidence,name),type:'jpeg',quality:90});};
 for(const [selector,name] of [['.intro','yardu-contrast-intro.jpg'],['.home-services','yardu-contrast-package.jpg'],['.home-service-grid','yardu-contrast-package-cards.jpg'],['.additional-services .service-grid','yardu-contrast-additional-cards.jpg'],['.gallery-preview','yardu-contrast-gallery.jpg'],['#estimate-form','yardu-contrast-form.jpg']])await capture(selector,name);
 await page.locator('.additional-services .service-card').first().hover();await capture('.additional-services .service-grid','yardu-contrast-card-hover.jpg');
 const originalIntro=await page.locator('.additional-services .section-heading>p:last-child').textContent();
 // Reproduce only the previous local styles in an isolated page; no site file is changed.
 await page.locator('.additional-services .section-heading>p:last-child').evaluate(el=>el.textContent='YardU also advertises these services. Discuss the exact scope, availability, and timing directly with the team.');
 const oldStyles=await page.addStyleTag({content:'.additional-services .section-heading h2{color:white!important}.additional-services .section-heading>p:last-child{color:#c7cfcc!important}.additional-services .eyebrow{color:#ff9999!important}.process-caption{padding:0!important;background:transparent!important;border-radius:0!important}.process-caption span{color:#cc0000!important;letter-spacing:.12em!important;font-weight:800!important}'});
 await capture('.additional-services','yardu-contrast-services-before.jpg');await capture('.process-visual','yardu-contrast-caption-before.jpg');await oldStyles.evaluate(el=>el.remove());
 await page.locator('.additional-services .section-heading>p:last-child').evaluate((el,text)=>el.textContent=text,originalIntro);
 await capture('.additional-services','yardu-contrast-services-desktop.jpg');await capture('.process-visual','yardu-contrast-caption-desktop.jpg');
 console.log('Manual shared-section/state captures and isolated before/after reproductions complete.');
}finally{await browser.close();}
