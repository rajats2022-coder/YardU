import {createServer} from 'node:http';
import {gzipSync} from 'node:zlib';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createChatService} from './chat-service.mjs';
const defaultRoot=fileURLToPath(new URL('../dist/',import.meta.url));
const aliases={'/services/':'/services-2/','/about/':'/our-mission/','/gallery/':'/projects/','/contact/':'/getestimate/'};
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.mjs':'application/javascript','.png':'image/png','.jpeg':'image/jpeg','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2','.xml':'application/xml','.txt':'text/plain'};
const csp="default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self'; connect-src 'self' https://*.cartocdn.com https://basemaps.cartocdn.com; worker-src 'self' blob:; form-action 'none'; frame-src 'none'; base-uri 'self'";
const json=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
function readJSON(req){return new Promise((resolveJSON,reject)=>{
 let bytes=0,done=false;const chunks=[];
 const finish=(error,value)=>{if(done)return;done=true;clearTimeout(timer);if(error)reject(error);else resolveJSON(value);};
 const timer=setTimeout(()=>finish(new Error('Request timeout')),5000);timer.unref();
 req.on('data',chunk=>{if(done)return;bytes+=chunk.length;if(bytes>4096){finish(new RangeError('Request too large'));return;}chunks.push(chunk);});
 req.once('end',()=>{if(done)return;try{finish(null,JSON.parse(Buffer.concat(chunks).toString('utf8')));}catch{finish(new Error('Invalid JSON'));}});
 req.once('error',()=>finish(new Error('Request failed')));
});}
export function createPreviewServer({root=defaultRoot,chat=createChatService()}={}){
 const server=createServer(async(req,res)=>{
  res.setHeader('Content-Security-Policy',csp);res.setHeader('X-Robots-Tag','noindex, nofollow');res.setHeader('X-Content-Type-Options','nosniff');
  let path;try{path=decodeURIComponent(new URL(req.url||'/',`http://${req.headers.host||'localhost'}`).pathname);}catch{json(res,400,{error:'Invalid request'});return;}
  if(path==='/api/chat-status'&&req.method==='GET'){json(res,200,chat.status());return;}
  if(path==='/api/chat'){
   if(req.method!=='POST'){res.setHeader('Allow','POST');json(res,405,{error:'Use the service guide'});return;}
   const host=req.headers.host||'';
   if(!/^(?:localhost|127\.0\.0\.1):\d+$/.test(host)||req.headers.origin!==`http://${host}`){json(res,403,{error:'Open the guide from this preview'});return;}
   if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||'')){json(res,415,{error:'Use the service guide'});return;}
   try{
    const body=await readJSON(req);
    if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).length!==2||!Object.hasOwn(body,'features')||!Object.hasOwn(body,'session')){json(res,400,{error:'Personal details belong in the estimate form'});return;}
    const result=await chat.answer({features:body.features,session:body.session,ip:req.socket.remoteAddress||'local'});const {status,...value}=result;json(res,status,value);
   }catch(error){json(res,error instanceof RangeError?413:400,{error:'Choose a shorter service question without personal details'});}
   return;
  }
  if(!['GET','HEAD'].includes(req.method||'')){res.setHeader('Allow','GET, HEAD');res.writeHead(405);res.end('Lead delivery is disconnected');return;}
  try{
   if(aliases[path]){res.writeHead(302,{Location:aliases[path]});res.end();return;}
   const clean=path==='/'?'index.html':extname(path)?path.slice(1):`${path.replace(/^\//,'').replace(/\/$/,'')}/index.html`;
   const target=resolve(root,clean);if(!target.startsWith(resolve(root)+'/'))throw new Error('Invalid path');
   let data=await readFile(target);const type=mime[extname(target)]||'application/octet-stream';const headers={'Content-Type':type,'Cache-Control':'no-store','Vary':'Accept-Encoding'};if(data.length>1024&&/html|css|javascript|svg|xml|text/.test(type)&&/\bgzip\b/.test(req.headers['accept-encoding']||'')){data=gzipSync(data);headers['Content-Encoding']='gzip';}headers['Content-Length']=data.length;res.writeHead(200,headers);res.end(req.method==='HEAD'?undefined:data);
  }catch{
   let fallback;
   try{fallback=await readFile(resolve(root,'404.html'));}
   catch{res.writeHead(503,{'Content-Type':'text/plain; charset=utf-8','Retry-After':'1'});res.end(req.method==='HEAD'?undefined:'Preview is rebuilding. Please refresh.');return;}
   res.writeHead(404,{'Content-Type':'text/html'});res.end(req.method==='HEAD'?undefined:fallback);
  }
 });
 server.requestTimeout=10000;server.headersTimeout=10000;return server;
}
