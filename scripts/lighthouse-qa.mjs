import lighthouse from 'lighthouse';
import {launch} from 'chrome-launcher';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {browserPath} from './browser-runtime.mjs';
const root=resolve(import.meta.dirname,'..'),out=resolve(root,'qa/lighthouse');await mkdir(out,{recursive:true});
const routes=process.env.YARDU_LH_ROUTES?process.env.YARDU_LH_ROUTES.split(','):['/','/services-2/','/services/lawn-maintenance/','/services/leaf-debris-removal/','/service-areas/','/service-areas/fuquay-varina/','/our-mission/','/projects/','/getestimate/'];
const formFactor=process.env.YARDU_LH_DESKTOP==='1'?'desktop':'mobile';
const chrome=await launch({chromePath:browserPath,chromeFlags:['--headless','--no-sandbox','--disable-dev-shm-usage','--disable-gpu'],logLevel:'silent'});
const results=[];
try{
 for(const path of routes){
  const config=formFactor==='desktop'?{extends:'lighthouse:default',settings:{formFactor:'desktop',screenEmulation:{mobile:false,width:1350,height:940,deviceScaleFactor:1,disabled:false},throttling:{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1,requestLatencyMs:0,downloadThroughputKbps:0,uploadThroughputKbps:0}}}:undefined;
  const report=await lighthouse('http://localhost:4319'+path,{port:chrome.port,logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']},config);
  const lhr=report.lhr,slug=path==='/'?'home':path.replaceAll('/','-').replace(/^-|-$/g,'');
  await writeFile(resolve(out,`${formFactor}-${slug}.json`),JSON.stringify(lhr));
  await writeFile(resolve(out,`${formFactor}-${slug}.html`),report.report);
  const failed=Object.values(lhr.audits).filter(a=>a.score!==null&&a.score<1).map(a=>({id:a.id,title:a.title,score:a.score,displayValue:a.displayValue,description:a.description,details:a.details}));
  const summary={path,formFactor,time:new Date().toISOString(),scores:Object.fromEntries(Object.entries(lhr.categories).map(([key,value])=>[key,Math.round(value.score*100)])),metrics:{FCP:lhr.audits['first-contentful-paint'].numericValue,LCP:lhr.audits['largest-contentful-paint'].numericValue,TBT:lhr.audits['total-blocking-time'].numericValue,CLS:lhr.audits['cumulative-layout-shift'].numericValue,SI:lhr.audits['speed-index'].numericValue},warnings:lhr.runWarnings,failed};
  results.push(summary);console.log(JSON.stringify({path,formFactor,scores:summary.scores,metrics:summary.metrics,warnings:summary.warnings}));
 }
 if(process.env.YARDU_LH_ROUTES){try{const previous=JSON.parse(await readFile(resolve(root,`qa/lighthouse-${formFactor}-results.json`),"utf8"));for(const entry of previous.results)if(!results.some(item=>item.path===entry.path))results.push(entry);}catch{}}
 await writeFile(resolve(root,`qa/lighthouse-${formFactor}-results.json`),JSON.stringify({version:'13.5.0',time:new Date().toISOString(),method:formFactor==='mobile'?'Default Lighthouse simulated mobile throttling (4x CPU, slow 4G)':'Desktop screen 1350x940, 1x CPU, simulated 10 Mbps',preview:'Loopback local preview; intentionally blocked from indexing; not a production or field measurement',results},null,2)+'\n');
}finally{await chrome.kill();}
