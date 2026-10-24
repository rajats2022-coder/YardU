import {classifyLocally,factualResponse} from '../assets/chat-facts.js';
import {SERVICE_IDS,QUESTION_IDS,CITY_IDS,QUALIFIER_IDS} from '../assets/chat-intents.js';
export const GROQ_MODEL='openai/gpt-oss-20b';
const endpoint='https://api.groq.com/openai/v1/chat/completions';
const topics=['service','areas','contact','pricing','booking','mission','unknown'];
const cities={raleigh:'Raleigh',cary:'Cary',apex:'Apex','wake-forest':'Wake Forest','fuquay-varina':'Fuquay-Varina','holly-springs':'Holly Springs'};
const schema={type:'object',properties:{topic:{type:'string',enum:topics},service:{type:'string',enum:['none',...SERVICE_IDS]}},required:['topic','service'],additionalProperties:false};
export function validFeatures(value){
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const allowed={services:SERVICE_IDS,questions:QUESTION_IDS,cities:CITY_IDS,qualifiers:QUALIFIER_IDS};
 return Object.keys(value).length===4&&Object.entries(allowed).every(([key,options])=>Array.isArray(value[key])&&value[key].length<=options.length&&new Set(value[key]).size===value[key].length&&value[key].every(item=>typeof item==='string'&&options.includes(item)));
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
