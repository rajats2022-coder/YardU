import {featuresFromText} from './chat-intents.js';
const chatLauncher=document.querySelector('.yardu-chat-launcher');
const chatPanel=document.querySelector('.yardu-chat-panel');
const chatClose=document.querySelector('.yardu-chat-close');
const question=document.querySelector('#yardu-chat-message');
const guideForm=document.querySelector('#yardu-guide-form');
const error=document.querySelector('#yardu-chat-error');
const answer=document.querySelector('#yardu-chat-answer');
const submit=document.querySelector('#yardu-guide-form button');
const status=document.querySelector('[data-chat-status]');
const draftToggle=document.querySelector('[data-chat-draft-toggle]');
const draft=document.querySelector('#yardu-chat-draft');
const draftForm=document.querySelector('#yardu-draft-form');
const draftSummary=document.querySelector('#yardu-draft-summary');
const session=crypto.randomUUID();
let pending=false;
/** @param {boolean} open */
const setChatOpen=open=>{
 if(!(chatLauncher instanceof HTMLButtonElement)||!(chatPanel instanceof HTMLElement))return;
 chatLauncher.setAttribute('aria-expanded',String(open));chatPanel.hidden=!open;
 if(open&&chatClose instanceof HTMLButtonElement)chatClose.focus();
 if(!open)chatLauncher.focus();
};
chatLauncher?.addEventListener('click',()=>setChatOpen(chatLauncher.getAttribute('aria-expanded')!=='true'));
chatClose?.addEventListener('click',()=>setChatOpen(false));
chatPanel?.addEventListener('keydown',event=>{if(event instanceof KeyboardEvent&&event.key==='Escape'){event.preventDefault();setChatOpen(false);}});
chatPanel?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setChatOpen(false)));
window.addEventListener('pageshow',()=>{if(chatPanel instanceof HTMLElement)chatPanel.hidden=true;chatLauncher?.setAttribute('aria-expanded','false');});
const paths=new Set(['/services-2/','/services/lawn-maintenance/','/services/mulch-straw-rock/','/services/leaf-debris-removal/','/services/hardscaping/','/services/pressure-washing/','/services/property-cleanups/','/services/sod/','/service-areas/wake-forest/','/service-areas/','/our-mission/','/getestimate/']);
async function askGuide(){
 if(pending||!(question instanceof HTMLInputElement)||!(submit instanceof HTMLButtonElement)||!(answer instanceof HTMLElement))return;
 const text=question.value.trim();
 if(!text){question.setAttribute('aria-invalid','true');if(error)error.textContent='Choose a suggested question or enter a service question.';question.focus();return;}
 question.removeAttribute('aria-invalid');if(error)error.textContent='';pending=true;submit.disabled=true;submit.textContent='Checking the guide…';answer.setAttribute('aria-busy','true');
 try{
  // The only outgoing user payload is the fixed allowlist of general service tags.
  const response=await fetch('/api/chat',{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},body:JSON.stringify({features:featuresFromText(text),session}),signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new Error('Guide unavailable');
  const data=await response.json();
  if(typeof data.answer!=='string'||!paths.has(data.link?.path)||!['verified-guide','groq-assisted'].includes(data.source))throw new Error('Invalid guide');
  const copy=answer.querySelector('[data-chat-answer]'),link=answer.querySelector('[data-chat-link]'),source=answer.querySelector('[data-chat-source]'),follow=answer.querySelector('[data-chat-follow-up]');
  if(copy)copy.textContent=data.answer;
  if(link instanceof HTMLAnchorElement){link.href=data.link.path;link.textContent=data.link.label+' →';}
  if(source)source.textContent=data.source==='groq-assisted'?'AI-assisted · verified YardU facts':'Verified service guide';
  if(follow)follow.textContent='Prepare a draft below, then confirm the job with YardU.';
  if(status)status.textContent=data.source==='groq-assisted'?'AI-assisted guide':'Verified guide';
  answer.hidden=false;
 }catch{
  if(error)error.textContent='The guide is unavailable. Explore services or call YardU at (919) 592-8328.';
  if(status)status.textContent='Call the team';
 }finally{pending=false;submit.disabled=false;submit.textContent='Ask the guide';answer.removeAttribute('aria-busy');}
}
guideForm?.addEventListener('submit',event=>{event.preventDefault();void askGuide();});
chatPanel?.querySelectorAll('[data-chat-question]').forEach(button=>button.addEventListener('click',()=>{if(question instanceof HTMLInputElement){question.value=button.getAttribute('data-chat-question')||'';void askGuide();}}));
draftToggle?.addEventListener('click',()=>{
 if(!(draft instanceof HTMLElement))return;
 const open=draft.hidden;draft.hidden=!open;draftToggle.setAttribute('aria-expanded',String(open));
 if(open){const first=draft.querySelector('select');first?.focus();first?.scrollIntoView({block:'nearest'});}
});
draftForm?.addEventListener('submit',event=>{
 event.preventDefault();
 const service=document.querySelector('#yardu-draft-service'),town=document.querySelector('#yardu-draft-town'),details=document.querySelector('#yardu-draft-details');
 if(!(service instanceof HTMLSelectElement)||!(town instanceof HTMLSelectElement)||!(details instanceof HTMLTextAreaElement)||!(draftForm instanceof HTMLFormElement)||!(draftSummary instanceof HTMLElement))return;
 if(!draftForm.reportValidity())return;
 for(const [selector,value]of [['[data-draft-service]',service.value],['[data-draft-town]',town.value],['[data-draft-details]',details.value.trim()||'Discuss the job with YardU.']]){const item=draftSummary.querySelector(selector);if(item)item.textContent=value;}
 draftForm.hidden=true;draftSummary.hidden=false;draftSummary.focus();draftSummary.scrollIntoView({block:'nearest'});
});
document.querySelector('[data-chat-edit]')?.addEventListener('click',()=>{if(draftForm instanceof HTMLElement&&draftSummary instanceof HTMLElement){draftForm.hidden=false;draftSummary.hidden=true;document.querySelector('#yardu-draft-service')?.scrollIntoView({block:'nearest'});const first=draftForm.querySelector('select');first?.focus();}});
