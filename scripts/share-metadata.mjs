export const shareImagePath='/assets/images/yardu-share-v1.png';
export const homeShareTitle='YardU | Landscaping with a Purpose';
export const homeShareDescription='YardU lawn care and landscaping in Raleigh and the Triangle, training tomorrow’s youth one yard at a time.';
const verifiedReviewOrigin='https://yardu-navy.vercel.app';

// Canonicals remain hireyardu.com. Social assets must use the public host serving this build.
export function resolveShareOrigin(env=process.env){
 const value=env.YARDU_SHARE_ORIGIN||(env.VERCEL_PROJECT_PRODUCTION_URL?`https://${env.VERCEL_PROJECT_PRODUCTION_URL}`:verifiedReviewOrigin);
 let url;try{url=new URL(value);}catch{throw new Error('Share origin must be an absolute public HTTPS origin');}
 if(url.protocol!=='https:'||url.username||url.password||url.port||url.pathname!=='/'||url.search||url.hash||!/^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(url.hostname)||/\.(?:local|localhost)$/i.test(url.hostname))throw new Error('Share origin must be an absolute public HTTPS origin without credentials, path or query');
 return url.origin;
}

const escapeAttribute=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function shareMetadata(page,origin=resolveShareOrigin()){
 const title=page.path==='/'?homeShareTitle:page.title;
 const description=page.path==='/'?homeShareDescription:page.description;
 const image=origin+shareImagePath;
 const alt='YardU logo with the slogan Landscaping with a Purpose on a white background.';
 const tags=[
  ['property','og:title',title],['property','og:description',description],['property','og:url',origin+page.path],
  ['property','og:image',image],['property','og:image:secure_url',image],['property','og:image:type','image/png'],
  ['property','og:image:width','1200'],['property','og:image:height','630'],['property','og:image:alt',alt],
  ['name','twitter:card','summary_large_image'],['name','twitter:title',title],['name','twitter:description',description],
  ['name','twitter:image',image],['name','twitter:image:alt',alt]
 ];
 return tags.map(([attribute,key,value])=>`<meta ${attribute}="${key}" content="${escapeAttribute(value)}">`).join('');
}
