import {readFile} from 'node:fs/promises';
// Same snapshot-based rendering model as the agency reference. No API credentials
// or another client's review data are included. Missing data is an honest hold.
export async function loadYardUReviews(){
 let data;
 try{data=JSON.parse(await readFile(new URL('../data/google-reviews.json',import.meta.url),'utf8'));}
 catch(error){if(error.code!=='ENOENT')throw error;return null;}
 if(data.status!=='verified'||data.source!=='google-business-profile'||data.businessName!=='YardU'||data.businessUrl!=='https://hireyardu.com')throw new Error('Review snapshot needs verified YardU identity and source.');
 if(!Array.isArray(data.reviews)||!data.reviews.length||!Number.isFinite(data.rating)||data.rating<0||data.rating>5||!Number.isInteger(data.reviewCount)||data.reviewCount<data.reviews.length||!/^\d{4}-\d{2}-\d{2}$/.test(data.observedAt))throw new Error('Review snapshot has incomplete aggregate or observation facts.');
 for(const key of ['googleReviewsUrl','googleWriteReviewUrl']){const url=new URL(data[key]);if(url.protocol!=='https:'||!['www.google.com','google.com','search.google.com','maps.google.com','maps.app.goo.gl','g.page'].includes(url.hostname))throw new Error('Review links need a verified Google destination.');}
 for(const review of data.reviews){if(typeof review.name!=='string'||typeof review.text!=='string'||!review.name.trim()||!review.text.trim()||!Number.isInteger(review.rating)||review.rating<1||review.rating>5)throw new Error('Review snapshot contains incomplete reviews.');}
 return data;
}
export const escapeHTML=(value)=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
