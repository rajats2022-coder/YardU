import {chromium,browserPath,requireBrowserQA} from './browser-runtime.mjs';
requireBrowserQA();
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'..'),evidence=resolve(root,'../evidence');
const original=await readFile(resolve(root,'assets/images/yardu-logo.svg'),'utf8'),framed=await readFile(resolve(root,'assets/images/yardu-logo-centered.svg'),'utf8');
assert.equal(original.replace('viewBox="0 0 375 374.999991"','viewBox="4.875 0 375 374.999991"'),framed,'Only presentation framing changed');
const browser=await chromium.launch({executablePath:browserPath});const results=[];
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});
 const heroMotion=[];
 for(const width of [1280,390]){
  await page.setViewportSize({width,height:900});await page.goto('http://localhost:4319/',{waitUntil:'networkidle'});
  for(const selector of ['.brand img','.footer-brand img',...(width===1280?['.home-hero-brand img']:[])]){
   const image=page.locator(selector);const result=await image.evaluate(async img=>{await img.decode();const box=img.getBoundingClientRect(),style=getComputedStyle(img),canvas=document.createElement('canvas');canvas.width=500;canvas.height=500;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,500,500);const pixels=ctx.getImageData(0,0,500,500).data;let min=500,max=0;for(let x=0;x<500;x++)for(let y=0;y<500;y++){const i=(y*500+x)*4;if(pixels[i+3]>128&&Math.min(pixels[i],pixels[i+1],pixels[i+2])<180){min=Math.min(min,x);max=Math.max(max,x);}}return{width:box.width,height:box.height,objectPosition:style.objectPosition,visibleCenter:(min+max)/2,maxHeight:style.maxHeight};});
   assert.equal(result.width,result.height,`${selector}: square badge`);assert.equal(result.objectPosition,'50% 50%');assert.ok(Math.abs(result.visibleCenter-250)<=1,`${selector}: visible mark/tagline centered`);results.push({viewport:width,selector,...result});
  }
  if(width===1280){
   const badge=page.locator('.home-hero-brand');
   assert.equal(await badge.locator('img').count(),1,'One complete hero logo');
   assert.equal(await badge.locator('span').count(),0,'No duplicate adjacent tagline');
   for(const reducedMotion of ['no-preference','reduce']){
    await page.emulateMedia({reducedMotion});
    const state=await badge.evaluate(el=>{const s=getComputedStyle(el,'::after'),box=el.getBoundingClientRect();return{animation:s.animationName,duration:s.animationDuration,overflow:getComputedStyle(el).overflow,width:box.width,height:box.height};});
    assert.equal(state.animation,reducedMotion==='reduce'?'none':'yardu-logo-shine');assert.equal(state.overflow,'hidden');
    if(reducedMotion==='no-preference')assert.equal(state.duration,'12s');
    heroMotion.push({reducedMotion,...state});
   }
   assert.equal(heroMotion[0].width,heroMotion[1].width);assert.equal(heroMotion[0].height,heroMotion[1].height);
   await badge.screenshot({path:resolve(evidence,'yardu-hero-logo.png')});
   await page.emulateMedia({reducedMotion:'no-preference'});
   await page.evaluate(()=>{const a=document.getAnimations().find(a=>a.animationName==='yardu-logo-shine');a.pause();a.currentTime=9750;});
   await badge.screenshot({path:resolve(evidence,'yardu-hero-logo-shine.png')});
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.setViewportSize({width:1280,height:800});
   await page.screenshot({path:resolve(evidence,'yardu-final-desktop-home.jpg'),type:'jpeg',quality:90});
   await page.screenshot({path:resolve(evidence,'yardu-final-desktop-full.jpg'),type:'jpeg',quality:85,fullPage:true});
   await page.setViewportSize({width:1280,height:900});
   await page.emulateMedia({reducedMotion:'no-preference'});
  }
  await page.screenshot({path:resolve(evidence,`yardu-logo-${width===1280?'desktop':'mobile'}.jpg`),type:'jpeg',quality:90});await page.locator('.brand').screenshot({path:resolve(evidence,`yardu-logo-badge-${width===1280?'desktop':'mobile'}.png`)});
 }
 await writeFile(resolve(root,'qa/logo-results.json'),JSON.stringify({status:'passed',originalIdentityPreserved:true,heroMotion,results},null,2)+'\n');console.log(JSON.stringify({status:'passed',heroMotion,results}));
}finally{await browser.close();}
