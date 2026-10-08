import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {additionalServices} from '../scripts/additional-services.mjs';
import {newlyConfirmedServices} from '../scripts/new-services.mjs';
import {featuresFromText} from '../assets/chat-intents.js';
import {createChatService} from '../server/chat-service.mjs';

const root=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,root),'utf8');
const routes=['plant-installs','aeration-overseeding','drainage','christmas-light-installs','snow-removal'];
const page=slug=>read(`dist/services/${slug}/index.html`);

test('All existing services/routes and the CRM integration survive the extension',async()=>{
 assert.deepEqual(additionalServices.slice(0,6).map(s=>s.slug),['property-cleanups','sod','mulch-straw-rock','leaf-debris-removal','hardscaping','pressure-washing']);
 assert.deepEqual(newlyConfirmedServices.map(s=>s.slug),routes);
 const manifest=JSON.parse(await read('route-manifest.json'));
 const registry=JSON.parse(await read('url-registry.json'));
 const originalRoutes=registry.routes.filter(path=>!routes.some(slug=>path===`/services/${slug}/`));
 assert.deepEqual(manifest.routes.slice(0,originalRoutes.length).map(r=>r.path),originalRoutes);
 assert.equal(manifest.routes.length,originalRoutes.length+5);
 for(const path of ['dist/index.html','dist/getestimate/index.html'])assert.ok((await read(path)).includes('embedNew/93604580-7d65-4275-8638-95088dcb20c6'));
 for(const path of ['vercel.json','server/preview-server.mjs'])assert.ok((await read(path)).length);
});

test('Every new service has the existing page structure, metadata, navigation and coverage',async()=>{
 const areas=['raleigh','cary','apex','wake-forest','fuquay-varina','holly-springs'];
 const home=await read('dist/index.html'),hub=await read('dist/services-2/index.html');
 assert.equal((home.match(/class="service-card"/g)||[]).length,12);
 assert.equal((hub.match(/class="service-card"/g)||[]).length,16);
 for(const service of newlyConfirmedServices){
  const html=await page(service.slug),path=`/services/${service.slug}/`;
  assert.equal((html.match(/<h1>/g)||[]).length,1);
  for(const className of ['service-scope','project-strip','service-process','faq-section','simple-cta'])assert.ok(html.includes(className),path+' '+className);
  assert.ok(html.includes(`rel="canonical" href="https://hireyardu.com${path}"`));
  assert.ok(html.includes('content="noindex,nofollow"'));
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
  assert.ok(graph.some(n=>n['@type']==='Service'&&n.name===service.name));
  for(const area of areas){
   assert.ok(html.includes(`href="/service-areas/${area}/"`));
   const guide=await read(`dist/service-areas/${area}/index.html`);
   assert.ok(guide.match(/<main[\s\S]*?<\/main>/)[0].includes(`href="${path}"`));
  }
  for(const host of [home,hub])assert.ok((host.match(new RegExp(`href="${path}"`,'g'))||[]).length>=4,'desktop + mobile + card + footer link');
 }
});

test('The service guide links the five confirmed services without rejecting aeration or inventing scope',async()=>{
 const chat=createChatService();let index=0;
 for(const [question,slug] of [
  ['plant installs','plant-installs'],['aeration and overseeding for my lawn','aeration-overseeding'],
  ['drainage','drainage'],['Christmas light installs','christmas-light-installs'],['snow removal','snow-removal']
 ]){
  const features=featuresFromText(question);assert.ok(!features.questions.includes('unknown-service'));
  const answer=await chat.answer({features,session:'services-check-session-'+index++,ip:'local-test'});
  assert.equal(answer.link.path,`/services/${slug}/`);
  assert.equal(answer.source,'verified-guide');
  assert.equal(answer.leadConnected,false);
  assert.doesNotMatch(answer.answer,/\$|guarantee|24\/7|same.day|insured|licensed/i);
 }
 assert.ok(featuresFromText('Do you offer fertilizer?').questions.includes('unknown-service'));
 const markup=await read('scripts/chat-markup.mjs');
 for(const service of newlyConfirmedServices)assert.ok(markup.includes(service.name.replaceAll('&','&amp;')));
});
