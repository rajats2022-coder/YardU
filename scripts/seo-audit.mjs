import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const manifest=JSON.parse(await readFile(resolve(root,'route-manifest.json'),'utf8'));
const registry=JSON.parse(await readFile(resolve(root,'url-registry.json'),'utf8'));
const cities=manifest.routes.filter(r=>r.type==='area-guide');
const services=manifest.routes.filter(r=>['service','package-component-guide'].includes(r.type));
let checks=0;const check=(value,message)=>{checks++;assert.ok(value,message);};
check(JSON.stringify(manifest.routes.map(r=>r.path))===JSON.stringify(registry.routes),'Frozen Page Map paths and order');
assert.deepEqual(manifest.redirects,registry.localAliases);checks++;
assert.deepEqual(manifest.externalPreserved,registry.preservedExternal);checks++;
assert.deepEqual(manifest.heldRoutes,registry.heldRoutes);checks++;
const clean=text=>text.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const htmls=new Map(),pages=[],h1s=new Set();
for(const route of manifest.routes){
 const file=route.path==='/'?'index.html':route.path==='/404/'?'404.html':route.path.slice(1)+'index.html';
 const html=await readFile(resolve(root,'dist',file),'utf8');
 const main=html.match(/<main\b[^>]*>(.*?)<\/main>/s)[1];htmls.set(route.path,main);
 const headings=[...main.matchAll(/<h([1-6])\b[^>]*>(.*?)<\/h\1>/gs)].map(m=>({level:Number(m[1]),text:clean(m[2])}));
 const h1=headings.filter(h=>h.level===1);check(h1.length===1,`${route.path}: exactly one main H1`);
 check(!h1s.has(h1[0].text),`${route.path}: unique H1`);h1s.add(h1[0].text);
 check(headings[0].level===1,`${route.path}: H1 introduces content`);
 for(let i=1;i<headings.length;i++){check(headings[i].level<=headings[i-1].level+1,`${route.path}: no skipped heading level`);check(Boolean(headings[i].text),`${route.path}: meaningful heading`);}
 const graph=html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
 const schema=graph?JSON.parse(graph[1])['@graph']:[];
 assert.deepEqual(schema.map(node=>node['@type']).sort(),[...route.schema].sort());checks++;
 if(schema.length){
  const org=schema.find(n=>n['@type']==='Organization'),site=schema.find(n=>n['@type']==='WebSite'),page=schema.find(n=>n['@type']==='WebPage');
  check(org.name==='YardU'&&org.telephone==='+19195928328'&&org.email==='jackson@hireyardu.com'&&org.founder.name==='Jackson DeSilva',`${route.path}: actual YardU entity`);
  check(org.areaServed?.length===6&&org.areaServed.every(n=>n['@type']==='City'),`${route.path}: organization has six public service areas`);
  if(route.type==='area-guide')check(page.about?.['@type']==='City'&&main.includes(page.about.name.split(',')[0]),`${route.path}: city schema matches visible location`);
  check(site.publisher['@id']===org['@id']&&page.isPartOf['@id']===site['@id'],`${route.path}: connected entity references`);
  check(page.url===route.canonical&&page.name===route.title&&page.description===route.description,`${route.path}: schema mirrors metadata`);
  const crumbs=schema.find(n=>n['@type']==='BreadcrumbList');
  if(crumbs){
   check(page.breadcrumb['@id']===crumbs['@id'],`${route.path}: breadcrumb graph reference`);
   for(const [index,item] of crumbs.itemListElement.entries())check(item.position===index+1&&Boolean(item.name)&&registry.routes.includes(new URL(item.item).pathname),`${route.path}: breadcrumb positions/names/URLs`);
   check(crumbs.itemListElement.at(-1).item===route.canonical,`${route.path}: current breadcrumb canonical`);
  }
  const service=schema.find(n=>n['@type']==='Service');
  if(service){check(service.provider['@id']===org['@id']&&page.mainEntity['@id']===service['@id'],`${route.path}: connected Service provider`);check(service.areaServed.length===6&&service.areaServed.every(n=>n['@type']==='City'),`${route.path}: six public towns, no office location`);}
  check(!schema.some(n=>['Review','AggregateRating','LocalBusiness','FAQPage'].includes(n['@type'])),`${route.path}: no unsupported rich-result types`);
 }
 pages.push({path:route.path,title:route.title,h1:h1[0].text,headings,schema:schema.map(n=>n['@type']),primaryIntent:route.type==='area-guide'?`lawn care ${h1[0].text.replace(/^(?:Lawn care|Landscaping) in /,'').replace(/\.$/,'')}`:route.type==='homepage'?'lawn care Raleigh / Triangle':route.type==='service'?h1[0].text:route.type==='package-component-guide'?`${h1[0].text}; package scope, not independent booking`:route.type,priorityBasis:'search intent and verified offering; no search-volume or GSC data supplied'});
}
const hasLink=(html,path)=>html.includes(`href="${path}"`);
const matrix=cities.map(city=>({city:pages.find(p=>p.path===city.path).h1.replace(/^(?:Lawn care|Landscaping) in /,'').replace(/\.$/,''),path:city.path,services:services.map(service=>{
 const cityLinksService=hasLink(htmls.get(city.path),service.path),serviceLinksCity=hasLink(htmls.get(service.path),city.path);
 check(cityLinksService,`${city.path}: content links ${service.path}`);check(serviceLinksCity,`${service.path}: content links ${city.path}`);
 return {service:pages.find(p=>p.path===service.path).h1,path:service.path,type:service.type,cityLinksService,serviceLinksCity,availability:'public town coverage; specific address, job scope and capacity must be confirmed',dedicatedCityServicePage:'held: city guide + canonical service route already cover scope; unique demand/local proof required before adding a separate route'};
})}));
check(htmls.get('/service-areas/fuquay-varina/').includes('Leaf removal in Fuquay-Varina'),'Explicit Fuquay leaf-removal heading');
check(htmls.get('/service-areas/fuquay-varina/').includes('does not collect debris left by landscape contractors'),'Distinct Fuquay contractor-debris context');
for(const media of registry.mediaPreservation.knownMedia){check((await readFile(resolve(root,'dist',media.proposedEquivalent.slice(1)))).length>0,`${media.sourcePath}: equivalent local asset exists`);check(media.disposition.includes('approval'),`${media.sourcePath}: release decision explicit`);}
const result={status:'passed',checks,substantivePages:manifest.routes.length-1,cities:cities.length,serviceAndComponentPages:services.length,bidirectionalPairs:matrix.reduce((n,row)=>n+row.services.length,0),pages,matrix,indexing:{preview:'noindex meta + header; robots Disallow; empty sitemap',candidate:`${manifest.routes.length-1} release candidates excluding 404`,launchSwitch:'No automatic production mode. Approved Page Map, fact review, entity validation, redirect decisions and lead destination precede an explicit production configuration change.'},urlFreeze:'url-registry.json is independently versioned; build tests fail on unapproved route/alias changes',schemaLimitation:'Semantic graph checks are not external validator or Google rich-result eligibility tests.'};
await writeFile(resolve(root,'seo-audit-results.json'),JSON.stringify(result,null,2)+'\n');
const short=r=>r.path.split('/').filter(Boolean).at(-1);
const text=`# Generated SEO coverage audit\n\nStatus: passed ${checks} assertions across ${manifest.routes.length} pages. This checks generated HTML, not assumed generator intent.\n\nSix town guides × ${services.length} service/component guides = **${matrix.reduce((n,row)=>n+row.services.length,0)} bidirectional coverage pairs**. ${services.filter(r=>r.type==='service').length} are service groups; four are components of the YardU Special. Coverage links do not guarantee address-level availability.\n\n| Town | ${services.map(short).join(' | ')} |\n| --- | ${services.map(()=> '---').join(' | ')} |\n${matrix.map(row=>`| ${row.city} | ${row.services.map(()=> '↔').join(' | ')} |`).join('\n')}\n\n↔ means the town content links to the service route and that service content links back to the town. Header/footer links alone do not satisfy this check. See seo-audit-results.json for every URL pair.\n\n## Keyword and heading map\n\nIntent priorities are based on verified offerings and useful user decisions. Search volume, GSC queries, local rankings and competitor demand have not been invented. Keyword mapping is editorial intent; JSON-LD separately describes entities and pages. H1 introduces each page, H2 groups its main subjects and H3 nests details/cards. No H4–H6 levels are forced for keyword repetition. All pages have a unique H1 and no skipped heading levels.\n\n| URL | Final title | Final H1 |\n| --- | --- | --- |\n${pages.filter(p=>p.path!='/404/').map(p=>`| ${p.path} | ${p.title.replaceAll('|','\\|')} | ${p.h1} |`).join('\n')}\n\n## Fuquay leaf-removal intent\n\n/service-areas/fuquay-varina/ explicitly includes “Leaf removal in Fuquay-Varina,” links to /services/leaf-debris-removal/, describes the advertised cleanup material, and cites the town’s contractor-debris exclusion. The leaf service links back to Fuquay and all other town guides. A separate /services/leaf-debris-removal/fuquay-varina/ is held: additional useful local scope/process/proof and search-intent evidence are needed to justify an independently maintained page. A blanket 54-page matrix is not proposed.\n\n## Actual schema and URL state\n\nOrganization, WebSite and WebPage on ${manifest.routes.length-1} substantive pages; matching BreadcrumbList on ${manifest.routes.length-2} inner pages; Service on the core package and ${services.filter(r=>r.type==='service').length-1} additional-service pages. Service provider/mainEntity references are connected and six public town names are represented as City areas served. Component guides remain WebPage, rather than independently bookable Services. No private address, office coordinates, hours, LocalBusiness, AggregateRating, Review or FAQ rich-result claims. 404 has no entity graph.\n\nurl-registry.json freezes all ${manifest.routes.length} proposed paths, four local aliases, four preserved external legacy pages; the existing /meet-the-founders/ path now contains Jackson’s sole-founder profile, held routes and 13 original media paths. Tests compare this independent registry against the generated manifest. Local aliases are 302 only; production one-to-one 301/308 decisions and a complete old media/video inventory remain pending. Review indexing is locked off; sitemap-candidate.xml contains ${manifest.routes.length-1} proposed production canonicals. Launch requires an explicit authorized configuration change across meta tags, headers, robots and sitemap; there is no accidental environment-variable launch switch. External validation and live verification remain pending.\n`;
await writeFile(resolve(root,'SEO-COVERAGE-AUDIT.md'),text);
console.log(`SEO audit passed ${checks} assertions; ${matrix.length} cities, ${services.length} service/component pages, ${matrix.reduce((n,row)=>n+row.services.length,0)} bidirectional pairs.`);
