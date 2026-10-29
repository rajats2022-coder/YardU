import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {guides} from '../scripts/guides.mjs';
import {structuredData,breadcrumbsFor} from '../scripts/seo.mjs';
const root=new URL('../',import.meta.url),origin='https://hireyardu.com';
const htmlFor=path=>readFile(new URL(`dist/${path.slice(1)}index.html`,root),'utf8');
const graphFor=guide=>JSON.parse(structuredData({path:guide.path,title:guide.title,description:guide.description,guide,breadcrumbName:guide.heading}).match(/<script[^>]*>(.*)<\/script>/s)[1])['@graph'];

test('each guide has its own article identity, canonical page, and actual Organization author',()=>{
 assert.equal(guides.length,4);
 for(const guide of guides){const graph=graphFor(guide),article=graph.find(n=>n['@type']==='BlogPosting'),page=graph.find(n=>n['@type']==='WebPage');
  assert.equal(article['@id'],origin+guide.path+'#article');assert.equal(article.url,page.url);assert.equal(article.mainEntityOfPage['@id'],page['@id']);assert.equal(page.mainEntity['@id'],article['@id']);
  assert.equal(article.author['@id'],origin+'/#organization');assert.equal(article.publisher['@id'],article.author['@id']);assert.ok(!graph.some(n=>n['@type']==='Person'&&n.name==='YardU Team'));assert.ok(!graph.some(n=>n['@type']==='FAQPage'));
  assert.equal(article.image,origin+'/assets/images/yardu-striped-residential-lawn.webp');assert.equal(article.datePublished,guide.publishedAt||undefined);assert.equal(article.dateModified,guide.modifiedAt||undefined);
  assert.deepEqual(breadcrumbsFor({path:guide.path,breadcrumbName:guide.heading}).map(n=>n.path),['/','/guides/',guide.path]);
 }
});

test('real publication dates are emitted only when explicitly supplied',()=>{
 const guide={...guides[0],publishedAt:'2026-10-19',modifiedAt:'2026-10-20'};
 const article=graphFor(guide).find(n=>n['@type']==='BlogPosting');assert.equal(article.datePublished,guide.publishedAt);assert.equal(article.dateModified,guide.modifiedAt);
});

test('guides, their parent services, and index provide reciprocal editorial paths',async()=>{
 const hub=await htmlFor('/guides/');
 for(const guide of guides){
  const html=await htmlFor(guide.path),service=await htmlFor(guide.parent);
  assert.ok(hub.includes(`href="${guide.path}"`));assert.ok(service.includes(`href="${guide.path}"`));
  assert.ok(html.includes(`href="${guide.parent}"`));assert.ok(html.includes('href="/guides/"'));assert.ok(html.includes('href="/getestimate/"'));
  for(const source of guide.sources)assert.ok(html.includes(source));
  assert.doesNotMatch(html,/2024-06|We see this all the time|years of hands-on|Editorial revision for review|Release notes:/);
 }
});

test('released leaf guide dates match reviewed metadata and distinguish contractor disposal',async()=>{
 const guide=guides.find(g=>g.slug==='raleigh-leaf-collection-fall-2026');
 const article=graphFor(guide).find(n=>n['@type']==='BlogPosting'),html=await htmlFor(guide.path);
 assert.equal(article.datePublished,guide.publishedAt);assert.equal(article.dateModified,guide.modifiedAt);
 assert.ok(html.includes(`<time datetime="${guide.publishedAt}">`));assert.match(html,/exclude yard waste produced by contracted jobs/);assert.match(html,/commercial vendors cannot drop off/);
});

test('candidate sitemap includes new routes; local previews stay out of search',async()=>{
 const sitemap=await readFile(new URL('dist/sitemap-candidate.xml',root),'utf8');
 for(const path of ['/guides/',...guides.map(g=>g.path)])assert.ok(sitemap.includes(origin+path));
 const manifest=JSON.parse(await readFile(new URL('route-manifest.json',root),'utf8'));
 if(manifest.mode==='local-review-only'){assert.doesNotMatch(await readFile(new URL('dist/sitemap.xml',root),'utf8'),/<loc>/);for(const guide of guides)assert.match(await htmlFor(guide.path),/content="noindex,nofollow"/);}
});
