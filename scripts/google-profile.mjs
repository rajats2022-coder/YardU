import {readFile} from 'node:fs/promises';
export const googleProfile=JSON.parse(await readFile(new URL('../data/google-profile.json',import.meta.url),'utf8'));
const url=new URL(googleProfile.googleReviewsUrl);
if(googleProfile.status!=='verified'||googleProfile.businessName!=='YardU'||googleProfile.businessUrl!=='https://hireyardu.com'||googleProfile.phone!=='+19195928328'||url.origin!=='https://www.google.com'||url.pathname!=='/maps'||url.searchParams.get('cid')!==googleProfile.cid||googleProfile.cid!=='9787269376349729307')throw new Error('Unverified YardU Google profile');
if(!Number.isFinite(googleProfile.rating)||googleProfile.rating<0||googleProfile.rating>5||!Number.isInteger(googleProfile.reviewCount)||googleProfile.reviewCount<0||!/^\d{4}-\d{2}-\d{2}$/.test(googleProfile.observedAt))throw new Error('Incomplete Google snapshot');
