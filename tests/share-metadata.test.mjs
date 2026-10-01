import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {resolveShareOrigin,shareMetadata,shareImagePath,homeShareTitle} from '../scripts/share-metadata.mjs';
const root=resolve(import.meta.dirname,'..');
test('Share host is independent of frozen production canonicals and protected deployment URLs',()=>{
 assert.equal(resolveShareOrigin({}),'https://yardu-navy.vercel.app');
 assert.equal(resolveShareOrigin({VERCEL_PROJECT_PRODUCTION_URL:'yardu-navy.vercel.app',VERCEL_URL:'protected-deployment.vercel.app'}),'https://yardu-navy.vercel.app');
 assert.equal(resolveShareOrigin({YARDU_SHARE_ORIGIN:'https://hireyardu.com',VERCEL_PROJECT_PRODUCTION_URL:'yardu-navy.vercel.app'}),'https://hireyardu.com');
 for(const value of ['http://yardu-navy.vercel.app','https://example.com/path','https://user:pass@example.com','https://example.com/?secret=1','https://localhost','https://127.0.0.1','https://example.com:444'])assert.throws(()=>resolveShareOrigin({YARDU_SHARE_ORIGIN:value}));
});
test('Home gets brand share copy; inner routes preserve topic copy and escape attributes',()=>{
 const home=shareMetadata({path:'/',title:'SEO title',description:'SEO description'},'https://yardu-navy.vercel.app');
 assert.ok(home.includes(`property="og:title" content="${homeShareTitle}"`));
 assert.ok(home.includes(`name="twitter:title" content="${homeShareTitle}"`));
 for(const field of ['og:image','og:image:secure_url','twitter:image'])assert.ok(home.includes(`="${field}" content="https://yardu-navy.vercel.app${shareImagePath}"`));
 assert.ok(home.includes('property="og:image:type" content="image/png"'));
 assert.ok(home.includes('property="og:image:width" content="1200"'));
 assert.ok(home.includes('property="og:image:height" content="630"'));
 const inner=shareMetadata({path:'/services-2/',title:'Services & "YardU"',description:'<factual>'},'https://yardu-navy.vercel.app');
 assert.ok(inner.includes('Services &amp; &quot;YardU&quot;'));
 assert.ok(inner.includes('&lt;factual&gt;'));
 assert.ok(inner.includes('property="og:url" content="https://yardu-navy.vercel.app/services-2/"'));
});
test('Committed share raster is readable 1200×630 PNG and vector embeds the complete authentic logo',async()=>{
 const png=await readFile(resolve(root,'assets/images/yardu-share-v1.png'));
 assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
 const svg=await readFile(resolve(root,'assets/images/yardu-share.svg'),'utf8');
 const embedded=Buffer.from(svg.match(/base64,([^"]+)/)[1],'base64').toString();
 assert.equal(embedded,await readFile(resolve(root,'assets/images/yardu-logo-centered.svg'),'utf8'));
 assert.equal((svg.match(/<image /g)||[]).length,1);
 assert.ok(!svg.includes('<text'),'No extra slogan is added beside the full logo');
});
