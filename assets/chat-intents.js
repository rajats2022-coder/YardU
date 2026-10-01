// Only these non-identifying tags may leave the browser. No raw chat text.
export const SERVICE_IDS=['lawn','mulch','leaf','hardscape','pressure'];
export const QUESTION_IDS=['scope','areas','pricing','booking','mission','unknown-service','unverified'];
export const CITY_IDS=['raleigh','cary','apex','wake-forest','fuquay-varina','holly-springs','other'];
export const QUALIFIER_IDS=['recurring','first-visit','overgrown','access','cleanup'];
/** @param {string} text */
export const redactPersonalData=text=>String(text)
 .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[contact removed]')
 .replace(/(?:\+?1[ .()-]*)?(?:\(?\d{3}\)?[ .-]*)\d{3}[ .-]*\d{4}\b/g,'[contact removed]')
 .replace(/\b\d{1,6}\s+[A-Z0-9][\w .'-]{0,60}\s(?:street|st|road|rd|avenue|ave|drive|dr|lane|ln|court|ct|boulevard|blvd|way|place|pl)\b\.?/gi,'[address removed]')
 .replace(/\b(?:my name is|i am|i'm|this is)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g,'[name removed]');
/** @param {string} text */
export const featuresFromText=text=>{
 const clean=redactPersonalData(text).toLowerCase();
 /** @param {Array<[string, RegExp]>} rules */
 const match=(rules)=>rules.filter(([,regex])=>regex.test(clean)).map(([id])=>id);
 const services=match([['lawn',/mow|lawn|edg|trim|blow|yardu special/],['mulch',/mulch|pine straw|\bstraw\b|\brock\b|landscape bed/],['leaf',/leaves|leaf|debris|fallen limb|\btwigs?\b/],['hardscape',/hardscap|patio|walkway|retaining wall|fire\s?pit/],['pressure',/pressure wash|power wash|clean.*(?:siding|driveway|deck)/]]);
 const questions=match([['scope',/includ|scope|offer|service|help with|what.*do|mow|leaf|mulch|hardscap|pressure/],['areas',/area|serve|where|\bnear\b|coverage/],['pricing',/price|pricing|cost|how much|discount|free quote|free estimate/],['booking',/book|schedule|availability|available|tomorrow|today|appointment|next week/],['mission',/purpose|mission|youth|founder|student|athlete/],['unknown-service',/gutter|window clean|irrigation|aerat|seed|fertiliz|pest|tree removal/],['unverified',/insur|licens|warrant|guarantee|hours|open|refund|payment|card number|ssn|social security/]]);
 const cities=match([['raleigh',/\braleigh\b/],['cary',/\bcary\b/],['apex',/\bapex\b/],['wake-forest',/\bwake forest\b/],['fuquay-varina',/\bfuquay(?:[ -]varina)?\b/],['holly-springs',/\bholly springs\b/]]);
 if(/outside|another town|other town|durham|chapel hill|carrboro/.test(clean))cities.push('other');
 const qualifiers=match([['recurring',/recurring|regular|weekly|ongoing/],['first-visit',/first visit|first time/],['overgrown',/overgrown|tall grass/],['access',/gate|fence|access|pet|parking/],['cleanup',/cleanup|clean up|pile|accumulat/]]);
 return {services,questions,cities,qualifiers};
};
