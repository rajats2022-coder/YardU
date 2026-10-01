import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {chromium,browserPath,requireBrowserQA} from './browser-runtime.mjs';
requireBrowserQA();
const root=resolve(import.meta.dirname,'..');
const logo=await readFile(resolve(root,'assets/images/yardu-logo-centered.svg'),'utf8');
// Embed the authentic full logo, including its one outlined slogan; no fonts or network inputs.
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#ffffff"/><rect x="80" y="308" width="170" height="6" rx="3" fill="#cc0000"/><rect x="950" y="308" width="170" height="6" rx="3" fill="#cc0000"/><image x="315" y="30" width="570" height="570" href="data:image/svg+xml;base64,${Buffer.from(logo).toString('base64')}"/></svg>`;
await writeFile(resolve(root,'assets/images/yardu-share.svg'),svg+'\n');
const browser=await chromium.launch({executablePath:browserPath});
try{
 const page=await browser.newPage({viewport:{width:1200,height:630},deviceScaleFactor:1});
 await page.setContent(`<html><body style="margin:0"><img width="1200" height="630" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}"></body></html>`);
 await page.locator('img').evaluate(img=>img.decode());
 await page.screenshot({path:resolve(root,'assets/images/yardu-share-v1.png'),type:'png'});
 console.log('Rendered authentic full-logo share image: 1200×630 PNG. No network or image generation.');
}finally{await browser.close();}
