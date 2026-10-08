import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {chromium,browserPath} from './browser-runtime.mjs';
const base=process.env.YARDU_QA_URL||'http://localhost:4328';
const manifest=JSON.parse(await readFile(new URL('../route-manifest.json',import.meta.url),'utf8'));
const browser=await chromium.launch({executablePath:browserPath});const results=[],errors=[];
await mkdir('qa/release',{recursive:true});
try{const context=await browser.newContext({viewport:{width:1280,height:900},bypassCSP:true});const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
await context.route('**/*',r=>new URL(r.request().url()).origin===base?r.continue():r.abort());
for(const width of [1280,390]){await p.setViewportSize({width,height:900});for(const route of manifest.routes.filter(r=>r.path!='/404/')){const response=await p.goto(base+route.path,{waitUntil:'domcontentloaded'});assert.equal(response.status(),200,route.path);await p.evaluate(()=>document.fonts.ready);await p.addScriptTag({path:'node_modules/axe-core/axe.min.js'});const state=await p.evaluate(async()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,violations:(await axe.run(document)).violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))}));results.push({width,path:route.path,...state});if(state.overflow)console.log('OVERFLOW',width,route.path);if(state.violations.length)console.log('VIOLATIONS',width,route.path,JSON.stringify(state.violations));}
await p.goto(base+'/service-areas/apex/');await p.screenshot({path:`qa/release/apex-${width}.jpg`,type:'jpeg',quality:85});}
await writeFile('qa/release/browser-results.json',JSON.stringify({base,results,errors,scope:'No external frames or form submissions; Chromium viewport QA and automated axe checks'},null,2));console.log(JSON.stringify({states:results.length,overflow:results.filter(r=>r.overflow).length,violations:results.filter(r=>r.violations.length).length,errors}));assert.ok(results.every(r=>!r.overflow&&!r.violations.length));assert.deepEqual(errors,[]);
}finally{await browser.close();}
