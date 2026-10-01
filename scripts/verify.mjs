import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..'),dist=resolve(root,'dist');
const manifest=JSON.parse(await readFile(resolve(root,'route-manifest.json'),'utf8'));
let checks=0;const check=(condition,message)=>{checks++;assert.ok(condition,message);};
const pages=new Map(),titles=new Set(),descriptions=new Set(),incoming=new Set();
const imageDimensions=JSON.parse(await readFile(resolve(root,'asset-dimensions.json'),'utf8'));
for(const route of manifest.routes){
 const file=route.path==='/'?'index.html':route.path==='/404/'?'404.html':route.path.slice(1)+'index.html';
 const html=await readFile(resolve(dist,file),'utf8');pages.set(route.path,html);
 check((html.match(/<h1(?:\s|>)/g)||[]).length===1,`${route.path}: one H1`);
 check(html.includes(`rel="canonical" href="${manifest.origin}${route.path}"`),`${route.path}: canonical`);
 check(html.includes('content="noindex,nofollow"'),`${route.path}: review noindex`);
 const title=html.match(/<title>(.*?)<\/title>/s)?.[1],description=html.match(/name="description" content="([^"]+)"/)?.[1];
 check(Boolean(title)&&!titles.has(title),`${route.path}: distinct title`);titles.add(title);
 check(Boolean(description)&&!descriptions.has(description),`${route.path}: distinct description`);descriptions.add(description);
 check(!/envision|jobber|googletagmanager|gtag\(|jotform|jackson@|localStorage|sessionStorage/i.test(html),`${route.path}: tenant isolation`);
 check(html.includes('tel:+19195928328'),`${route.path}: YardU phone`);
 check([...html.matchAll(/href="(tel:[^"]+)"/g)].every(m=>m[1]==='tel:+19195928328'),`${route.path}: normalized telephone`);
 for(const source of html.matchAll(/<source\b[^>]+>/g)){const set=source[0].match(/srcset="([^"]+)"/)?.[1];if(set)for(const item of set.split(',')){const [path,width]=item.trim().split(' ');check((await stat(resolve(dist,path.slice(1)))).size>0,`${route.path}: picture source exists`);check(imageDimensions[path.split('/').pop()]?.width===Number(width.replace('w','')),`${route.path}: picture width descriptor`);}}
 for(const image of html.matchAll(/<img\b[^>]+>/g)){
  check(/alt="[^"]+"/.test(image[0]),`${route.path}: informative image alt`);
  const name=image[0].match(/src="\/assets\/images\/([^\"]+)"/)?.[1],dimensions=imageDimensions[name];
  check(Boolean(dimensions)&&image[0].includes(`width="${dimensions.width}"`)&&image[0].includes(`height="${dimensions.height}"`),`${route.path}: intrinsic image dimensions`);
  const srcset=image[0].match(/srcset="([^\"]+)"/)?.[1];if(srcset)for(const item of srcset.split(',')){const path=item.trim().split(' ')[0];check((await stat(resolve(dist,path.slice(1)))).size>0,`${route.path}: responsive source ${path}`);}
 }
 if(route.path!=='/'&&route.path!=='/404/')check(html.includes('aria-label="Breadcrumb"'),`${route.path}: breadcrumb navigation`);
 for(const schema of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)){
  const data=JSON.parse(schema[1]);check(data['@context']==='https://schema.org',`${route.path}: valid schema context`);
  check(!/address|openingHours|aggregateRating|reviewCount|LocalBusiness/.test(schema[1]),`${route.path}: unsupported entity fields omitted`);
  check(data['@graph'].some(n=>n['@type']==='WebPage'&&n.url===manifest.origin+route.path),`${route.path}: matching WebPage`);
 }
 for(const ref of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)){
  const [path,fragment]=ref[1].split('#');if(path.startsWith('/assets/')||path.endsWith('.xml'))check((await stat(resolve(dist,path.slice(1)))).size>0,`${route.path}: asset ${path}`);
  else{check(manifest.routes.some(r=>r.path===path),`${route.path}: route ${path}`);if(path!==route.path)incoming.add(path);if(fragment){const target=pages.get(path)||await readFile(resolve(dist,path==='/'?'index.html':path.slice(1)+'index.html'),'utf8');check(target.includes(`id="${fragment}"`),`${route.path}: anchor ${ref[1]}`);}}
 }
}
for(const [route,html] of pages){
 if(route!=='/'&&route!=='/404/')check(incoming.has(route),`${route}: no orphan`);
 for(const match of html.matchAll(/<form\b[^>]*>/g))check(!/action=/.test(match[0]),`${route}: no connected action`);
}
const js=await readFile(resolve(dist,'assets/site.js'),'utf8');
check(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie/.test(js),'No outbound JS or persistence');
check(js.includes('event.preventDefault()'),'Validation does not send requests');
const chatJS=await readFile(resolve(dist,'assets/yardu-chat.js'),'utf8');check(!/XMLHttpRequest|sendBeacon|localStorage|sessionStorage|document\.cookie|api\.groq/.test(chatJS),'Chat has no persistence or client provider access');check(chatJS.includes("fetch('/api/chat'")&&chatJS.includes('features:featuresFromText(text)'),'Guide transmits only service tags to the local adapter');check(pages.get('/').includes('Nothing has been sent or saved'),'Lead draft visibly disconnected');
check(pages.get('/').includes('Read our Google reviews')&&!pages.get('/').includes('Real work. A brighter future.'),'Hero uses the requested verified Google button');for(const route of ['/','/reviews/']){check(pages.get(route).includes('cid=9787269376349729307'),'Google links use verified YardU CID');check(pages.get(route).includes('testimonials published on YardU’s website'),'Quote platform attribution remains truthful');}
const robots=await readFile(resolve(dist,'robots.txt'),'utf8');check(robots.includes('Disallow: /'),'Review robots');
const sitemap=await readFile(resolve(dist,'sitemap.xml'),'utf8');check(!sitemap.includes('<loc>'),'No noindex URLs in review sitemap');
const candidate=await readFile(resolve(dist,'sitemap-candidate.xml'),'utf8');
for(const route of manifest.routes.filter(r=>r.path!=='/404/'))check(candidate.includes(`<loc>${manifest.origin}${route.path}</loc>`),`Candidate sitemap: ${route.path}`);
check(!candidate.includes('/404/'),'404 excluded from candidate sitemap');
if(process.argv.includes('--http')){
 const base='http://localhost:4319';
 for(const route of manifest.routes.filter(r=>r.path!=='/404/')){const response=await fetch(base+route.path);check(response.status===200,`${route.path}: HTTP 200`);check(response.headers.get('content-security-policy')?.includes("form-action 'none'"),`${route.path}: submission disabled`);check(response.headers.get('x-robots-tag')==='noindex, nofollow',`${route.path}: header noindex`);}
 const missing=await fetch(base+'/not-a-real-yardu-page/');check(missing.status===404,'Missing route HTTP 404');check(missing.headers.get('x-robots-tag')==='noindex, nofollow','404 noindex');
 for(const [from,to] of Object.entries(manifest.redirects)){const response=await fetch(base+from,{redirect:'manual'});check(response.status===302&&response.headers.get('location')===to,`${from}: local alias`);}
 const head=await fetch(base,{method:'HEAD'});check(head.status===200&&(await head.text())==='','HEAD serves no body');
}
console.log(`Passed ${checks} checks across ${pages.size} pages${process.argv.includes('--http')?' including GET/HEAD HTTP checks':''}. No submissions made.`);
