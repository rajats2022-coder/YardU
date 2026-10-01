import {SERVICE_IDS,QUESTION_IDS,CITY_IDS,QUALIFIER_IDS} from '../assets/chat-intents.js';
export const GROQ_MODEL='openai/gpt-oss-20b';
const endpoint='https://api.groq.com/openai/v1/chat/completions';
const topics=['service','areas','contact','pricing','booking','mission','unknown'];
const cities={raleigh:'Raleigh',cary:'Cary',apex:'Apex','wake-forest':'Wake Forest','fuquay-varina':'Fuquay-Varina','holly-springs':'Holly Springs'};
const answers={
 lawn:{name:'The YardU Special',text:'The YardU Special combines mowing, edging, trimming and blowing off finished surfaces. Discuss the lawn condition, access and visit frequency with the team.',path:'/services/lawn-maintenance/'},
 mulch:{name:'Mulch, straw & rock',text:'YardU offers mulch, straw and rock installation for landscape beds. Share the beds, existing material, preferred finish and access so the team can discuss the scope.',path:'/services/mulch-straw-rock/'},
 leaf:{name:'Leaf & debris removal',text:'YardU offers collection and hauling of leaves, twigs and fallen limbs. Discuss the areas, material, access and removal arrangement separately from routine mowing.',path:'/services/leaf-debris-removal/'},
 hardscape:{name:'Hardscaping',text:'YardU lists patios, walkways, retaining walls and firepits. Describe the space and intended use, then confirm design, materials, relevant permits, timing and the estimate.',path:'/services/hardscaping/'},
 cleanup:{name:'Property cleanups',text:'YardU offers property cleanups. Describe the outdoor areas, current condition, access, and finish you want; confirm the included work, material handling, estimate, and timing with the team.',path:'/services/property-cleanups/'},
 sod:{name:'Sod',text:'YardU offers sod. Share the lawn areas, current condition, access, and goals; confirm suitable materials, preparation, care instructions, estimate, and scheduling directly with the team.',path:'/services/sod/'},
 pressure:{name:'Pressure washing',text:'YardU lists pressure washing for siding, driveways, decks and other surfaces. Share the material, condition and areas to clean; confirm a suitable method and expected finish.',path:'/services/pressure-washing/'}
};
const schema={type:'object',properties:{topic:{type:'string',enum:topics},service:{type:'string',enum:['none',...SERVICE_IDS]}},required:['topic','service'],additionalProperties:false};
export function validFeatures(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const allowed={services:SERVICE_IDS,questions:QUESTION_IDS,cities:CITY_IDS,qualifiers:QUALIFIER_IDS};
 return Object.keys(value).length===4&&Object.entries(allowed).every(([key,options])=>Array.isArray(value[key])&&value[key].length<=options.length&&new Set(value[key]).size===value[key].length&&value[key].every(item=>typeof item==='string'&&options.includes(item)));
}
const classifyLocally=f=>({topic:f.questions.includes('unknown-service')||f.questions.includes('unverified')?'unknown':f.questions.includes('pricing')?'pricing':f.questions.includes('booking')?'booking':f.questions.includes('contact')?'contact':f.questions.includes('mission')?'mission':f.questions.includes('areas')||f.cities.length?'areas':f.services.length?'service':'unknown',service:f.services.includes('sod')?'sod':f.services.includes('cleanup')?'cleanup':f.services[0]||'none'});
function factualResponse(choice,features){
 // Hard boundaries override model routing: no model-generated prices or availability.
 if(features.questions.includes('unknown-service')||features.questions.includes('unverified'))choice={topic:'unknown',service:'none'};
 else if(features.questions.includes('pricing'))choice={topic:'pricing',service:'none'};
 else if(features.questions.includes('booking'))choice={topic:'booking',service:'none'};
 if(features.cities.includes('wake-forest')&&features.qualifiers.includes('recurring'))return {answer:'Please contact YardU to confirm availability for your Wake Forest property, the service requested, and your preferred schedule.',link:{path:'/service-areas/wake-forest/',label:'Explore Wake Forest'},followUp:'Discuss the property and scope directly with YardU.',leadConnected:false};
 let answer,path='/getestimate/',label='Prepare your estimate';
 if(choice.topic==='service'&&answers[choice.service]){answer=answers[choice.service].text;path=answers[choice.service].path;label='Explore '+answers[choice.service].name;}
 else if(choice.topic==='areas'){answer='YardU lists Raleigh, Cary, Apex, Wake Forest, Fuquay-Varina and Holly Springs. Confirm your exact property and current availability with the team.';path='/service-areas/';label='See the area guides';if(features.cities.includes('other'))answer+=' For another town, ask the team directly; coverage is not confirmed here.';}
 else if(choice.topic==='contact')answer='Call or text YardU at (919) 592-8328. Contact hours are 6 AM–10 PM. Email jackson@hireyardu.com.';
 else if(choice.topic==='pricing')answer='An estimate depends on the actual property and agreed scope. Share the service, lawn or project condition, and access details with YardU to discuss price. This guide does not quote a rate or offer a discount.';
 else if(choice.topic==='booking')answer='YardU confirms address availability, scope, timing and visit frequency directly. This guide cannot reserve an appointment or promise a date. Call (919) 592-8328 or prepare an estimate request.';
 else if(choice.topic==='mission'){answer='YardU combines lawn care with opportunities for young people to learn responsibility, communication, professionalism and work ethic. Founded by Jackson DeSilva, its mission is training tomorrow’s youth, one yard at a time.';path='/our-mission/';label='Explore the mission';}
 else{answer='YardU lists the lawn package, mulch/straw/rock, leaf/debris removal, hardscaping, pressure washing, property cleanups and sod. The team can confirm other work and project-specific details. Call (919) 592-8328 or include your question in an estimate request.';path='/services-2/';label='Explore verified services';}
 return {answer,link:{path,label},followUp:'Would you like to prepare an estimate draft?',leadConnected:false};
}
export class FreeBudget{
 constructor({now=Date.now,requestsPerMinute=5,requestsPerDay=100,tokensPerMinute=6000,tokensPerDay=50000,requestsPerSession=6,requestsPerIP=20}={}){Object.assign(this,{now,requestsPerMinute,requestsPerDay,tokensPerMinute,tokensPerDay,requestsPerSession,requestsPerIP});this.minute=null;this.day=null;this.minuteRequests=0;this.dayRequests=0;this.minuteTokens=0;this.dayTokens=0;this.sessions=new Map();this.ips=new Map();this.blockedUntil=0;}
 reserve({session,ip,tokens}){
  const now=this.now(),minute=Math.floor(now/60000),day=Math.floor(now/86400000);
  if(now<this.blockedUntil)return false;
  if(this.minute!==minute){this.minute=minute;this.minuteRequests=0;this.minuteTokens=0;}
  if(this.day!==day){this.day=day;this.dayRequests=0;this.dayTokens=0;}
  for(const map of [this.sessions,this.ips])for(const [key,state]of map)if(now-state.started>=1800000)map.delete(key);
  if(this.sessions.size>=1000&&!this.sessions.has(session)||this.ips.size>=1000&&!this.ips.has(ip))return false;
  const sessionState=this.sessions.get(session)||{started:now,count:0},ipState=this.ips.get(ip)||{started:now,count:0};
  if(this.minuteRequests>=this.requestsPerMinute||this.dayRequests>=this.requestsPerDay||this.minuteTokens+tokens>this.tokensPerMinute||this.dayTokens+tokens>this.tokensPerDay||sessionState.count>=this.requestsPerSession||ipState.count>=this.requestsPerIP)return false;
  this.minuteRequests++;this.dayRequests++;this.minuteTokens+=tokens;this.dayTokens+=tokens;sessionState.count++;ipState.count++;this.sessions.set(session,sessionState);this.ips.set(ip,ipState);return true;
 }
 cooldown(ms){this.blockedUntil=Math.max(this.blockedUntil,this.now()+ms);}
}
export function createChatService({apiKey='',enabled=false,freePlanConfirmed=false,fetchImpl=globalThis.fetch,budget=new FreeBudget(),timeoutMs=6000}={}){
 const live=Boolean(apiKey&&enabled&&freePlanConfirmed);
 return {
  status:()=>({mode:live?'ai-assisted-guide':'verified-guide',leadConnected:false}),
  async answer({features,session,ip='local'}){
   if(!validFeatures(features)||typeof session!=='string'||!/^[-a-zA-Z0-9]{16,64}$/.test(session))return {status:400,error:'Choose a service question without personal details.'};
   const local=classifyLocally(features),fallback=reason=>({status:200,...factualResponse(local,features),source:'verified-guide',reason});
   if(!live)return fallback('connection-pending');
   // Unknown and transactional questions do not need a provider call.
   if(['pricing','booking','contact','unknown'].includes(local.topic)||features.cities.includes('wake-forest')&&features.qualifiers.includes('recurring'))return fallback('human-confirmation');
   const body={model:GROQ_MODEL,messages:[{role:'system',content:'Classify the non-identifying service tags. Return only the schema. Scope/service tags imply service, areas/town tags imply areas, mission implies mission. Pick service only from services tags; otherwise none. Do not generate text, prices, appointments or facts.'},{role:'user',content:JSON.stringify(features)}],temperature:0.1,reasoning_effort:'low',max_completion_tokens:512,response_format:{type:'json_schema',json_schema:{name:'yardu_service_intent',strict:true,schema}}};
   // UTF-8 byte count is a deliberately conservative token reservation including schema.
   const tokens=Buffer.byteLength(JSON.stringify(body),'utf8')+512;
   if(!budget.reserve({session,ip,tokens}))return fallback('free-budget-reached');
   try{
    const response=await fetchImpl(endpoint,{method:'POST',headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(timeoutMs),redirect:'error'});
    if(!response.ok){if(response.status===429){const retry=Number(response.headers.get('retry-after'));budget.cooldown(Math.min(3600000,Math.max(60000,Number.isFinite(retry)?retry*1000:60000)));}if([401,403,404].includes(response.status))budget.cooldown(1800000);return fallback('provider-unavailable');}
    const data=await response.json(),choice=JSON.parse(data.choices?.[0]?.message?.content||'null');
    if(!choice||Object.keys(choice).length!==2||!topics.includes(choice.topic)||!['none',...features.services].includes(choice.service))return fallback('provider-unavailable');
    const remainingRequests=Number(response.headers.get('x-ratelimit-remaining-requests')),remainingTokens=Number(response.headers.get('x-ratelimit-remaining-tokens'));
    if(response.headers.has('x-ratelimit-remaining-requests')&&remainingRequests<=1||response.headers.has('x-ratelimit-remaining-tokens')&&remainingTokens<512)budget.cooldown(60000);
    return {status:200,...factualResponse(choice,features),source:'groq-assisted',reason:null};
   }catch{return fallback('provider-unavailable');}
  }
 };
}
