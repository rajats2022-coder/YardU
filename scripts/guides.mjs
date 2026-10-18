import {readFile} from 'node:fs/promises';

const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const anchor=value=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const inline=value=>escape(value).replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,label,url)=>{
 if(!/^(\/[^/]|https:\/\/|tel:)/.test(url))throw new Error(`Unsupported guide link: ${url}`);
 return `<a href="${url}">${label}</a>`;
});

// Deliberately small Markdown subset: paragraphs, h2s, and ordered/unordered lists.
// Raw HTML is escaped. Business facts stay in reviewed source files, not a model call.
function render(markdown){
 const blocks=markdown.trim().split(/\n\s*\n/),headings=[];
 const title=blocks.shift().replace(/^# /,'');
 const content=blocks.map(block=>{
  if(block.startsWith('## ')){const text=block.slice(3).trim(),id=anchor(text);headings.push({text,id});return `<h2 id="${id}">${escape(text)}</h2>`;}
  const lines=block.split('\n');
  if(lines.every(line=>line.startsWith('- ')))return `<ul>${lines.map(line=>`<li>${inline(line.slice(2))}</li>`).join('')}</ul>`;
  if(lines.every(line=>/^\d+\. /.test(line)))return `<ol>${lines.map(line=>`<li>${inline(line.replace(/^\d+\. /,''))}</li>`).join('')}</ol>`;
  return `<p>${inline(lines.join(' '))}</p>`;
 }).join('\n');
 return {title,content,headings,minutes:Math.max(1,Math.ceil(markdown.split(/\s+/).length/200))};
}

const metadata=JSON.parse(await readFile(new URL('../data/guides.json',import.meta.url),'utf8'));
export const guides=await Promise.all(metadata.map(async meta=>{
 const article=render(await readFile(new URL(`../content/guides/${meta.slug}.md`,import.meta.url),'utf8'));
 for(const key of ['publishedAt','modifiedAt'])if(meta[key]&&!/^\d{4}-\d{2}-\d{2}$/.test(meta[key]))throw new Error(`Invalid guide ${key}`);
 if(meta.modifiedAt&&!meta.publishedAt)throw new Error('A modified date requires a real publication date');
 return {...meta,...article,path:`/guides/${meta.slug}/`,title:meta.title,heading:article.title};
}));

export const guideCards=()=>`<div class="guide-cards">${guides.map(g=>`<a class="guide-card" href="${g.path}"><span class="eyebrow">${g.label}</span><h3>${g.heading}</h3><p>${g.description}</p><span class="guide-card-bottom">${g.minutes} min read <span aria-hidden="true">↗</span></span></a>`).join('')}</div>`;
export const guidePromo=()=>`<section class="section-pad guide-promo"><div class="shell"><div class="guide-section-heading"><div><p class="eyebrow">Before you book</p><h2>A clearer plan for your lawn.</h2><p>Practical questions to help you compare estimates and choose a service.</p></div><a class="text-link" href="/guides/">All lawn care guides →</a></div>${guideCards()}</div></section>`;

export function guidePages(inner){
 const hub={path:'/guides/',title:'Lawn Care Guides | YardU',description:'Practical guides to lawn care estimates and choosing a mowing service in Raleigh, NC. Explore the YardU package and plan your request.',guideHub:true,breadcrumbName:'Lawn Care Guides',class:'inner-page guide-page guide-index',body:inner('Lawn care guides','Good questions.<br>Clear answers.','Plan your estimate, compare the work, and find the right fit for your yard.','yardu-striped-residential-lawn.webp','Striped residential lawn in YardU’s shared project album')+`<section class="section-pad"><div class="shell"><div class="guide-section-heading"><div><p class="eyebrow">Start here</p><h2>Make your next step easier.</h2><p>Two practical guides for homeowners considering lawn care in Raleigh and the Triangle.</p></div></div>${guideCards()}<p class="guide-hub-return">Ready to discuss your property? Explore <a href="/services/lawn-maintenance/">YardU’s lawn care package</a> or <a href="/getestimate/">request a free estimate</a>.</p></div></section>`};
 return [hub,...guides.map(g=>({path:g.path,title:g.title,description:g.description,guide:g,parent:'/guides/',breadcrumbName:g.heading,class:'inner-page guide-page',body:inner(g.label,escape(g.heading),g.description,'yardu-striped-residential-lawn.webp','Striped residential lawn in YardU’s shared project album')+`<section class="section-pad guide-reading"><div class="shell guide-layout"><article class="guide-copy" aria-label="${escape(g.heading)}"><p class="guide-byline">By <a href="/our-mission/">YardU</a><span aria-hidden="true"> · </span>${g.minutes} min read${g.publishedAt?`<span aria-hidden="true"> · </span><time datetime="${g.publishedAt}">${g.publishedAt}</time>`:''}</p>${g.content}<div class="guide-related"><p class="eyebrow">Keep planning</p><h2>Another useful question.</h2>${guides.filter(other=>other.slug!==g.slug).map(other=>`<a href="${other.path}">${other.heading} →</a>`).join('')}<a href="/guides/">Browse all lawn care guides →</a></div></article><aside class="guide-aside"><nav aria-label="On this page"><p class="eyebrow">In this guide</p><ul>${g.headings.map(h=>`<li><a href="${g.path}#${h.id}">${h.text}</a></li>`).join('')}</ul></nav><div class="guide-contact"><h2>Let’s talk about your yard.</h2><p>Share your property and the work you need. YardU will confirm scope and availability.</p><a class="button button-primary" href="/getestimate/">Request a free estimate</a><a class="guide-call" href="tel:+19195928328">Call (919) 592-8328</a></div></aside></div></section>`}))];
}
