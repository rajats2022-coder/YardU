import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const manifest=JSON.parse(await readFile('route-manifest.json','utf8'));
assert.equal(manifest.mode,'production');
const sitemap=await readFile('dist/sitemap.xml','utf8');const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,30);assert.equal(new Set(urls).size,30);
assert.match(await readFile('dist/robots.txt','utf8'),/Allow: \/\nSitemap: https:\/\/hireyardu.com\/sitemap.xml/);
const paths=new Set(manifest.routes.map(r=>r.path));
for(const route of manifest.routes){const html=await readFile('dist/'+(route.path==='/'?'index.html':route.path==='/404/'?'404.html':route.path.slice(1)+'index.html'),'utf8');assert.ok(html.includes(`content="${route.path==='/404/'?'noindex,nofollow':'index,follow'}"`));if(route.path!='/404/'){assert.ok(urls.includes(route.canonical));assert.ok(html.includes(`property="og:url" content="${route.canonical}"`));}for(const m of html.matchAll(/href="(\/[^"#?]*)/g)){if(m[1].startsWith('/assets/')||m[1]==='/sitemap.xml')continue;assert.ok(paths.has(m[1]),route.path+': broken internal '+m[1]);}}
const cfg=JSON.parse(await readFile('vercel.json','utf8'));assert.ok(cfg.headers.every(r=>r.headers.every(h=>h.key!=='X-Robots-Tag')));assert.ok(cfg.headers.some(r=>r.headers.some(h=>h.key==='Content-Security-Policy'&&h.value.includes('frame-src https://secure.copilotcrm.com'))));assert.ok(cfg.redirects.every(r=>r.statusCode===308));console.log('Production checks passed: 30 indexable canonicals, sitemap, robots, internal links, metadata and hosting configuration.');
