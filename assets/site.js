// Local-only UI. No integrations, storage, tracking, or outgoing form requests.
const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const scrim = document.querySelector('[data-menu-scrim]');
/** @type {Element | null} */
let previousFocus = null;
/** @param {boolean} open */
const setMenu = (open) => {
  if (!(menuButton instanceof HTMLElement) || !(mobileMenu instanceof HTMLElement) || !(scrim instanceof HTMLElement)) return;
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Menu open' : 'Open menu');
  mobileMenu.hidden = !open;
  mobileMenu.classList.toggle('is-open',open);
  if(!open)mobileMenu.querySelectorAll('details').forEach(detail=>{detail.open=false;});
  scrim.hidden = !open;
  scrim.classList.toggle('is-open',open);
  document.body.classList.toggle('menu-open',open);
  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  if (main instanceof HTMLElement) main.inert = open;
  if (footer instanceof HTMLElement) footer.inert = open;
  if (open) { previousFocus = document.activeElement; mobileMenu.querySelector('button')?.focus(); }
  else if (previousFocus instanceof HTMLElement) previousFocus.focus();
};
menuButton?.addEventListener('click',()=>setMenu(true));
document.querySelector('.menu-close')?.addEventListener('click',()=>setMenu(false));
scrim?.addEventListener('click',()=>setMenu(false));
document.querySelectorAll('.mobile-menu a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{
  if (!(mobileMenu instanceof HTMLElement) || mobileMenu.hidden) return;
  if (event.key==='Escape') setMenu(false);
  if(event.key==='Tab'){
    const controls=[...mobileMenu.querySelectorAll('a,button,summary')].filter(el=>el instanceof HTMLElement && el.getClientRects().length>0);
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&document.activeElement===first&&last instanceof HTMLElement){event.preventDefault();last.focus();}
    if(!event.shiftKey&&document.activeElement===last&&first instanceof HTMLElement){event.preventDefault();first.focus();}
  }
});
window.addEventListener('resize',()=>{if(innerWidth>1000)setMenu(false);});
// Keep fixed mobile controls clear of the keyboard without assuming browser-toolbar heights.
const syncVisualViewport=()=>{
 const focused=document.activeElement;
 const editing=focused instanceof HTMLInputElement||focused instanceof HTMLTextAreaElement||focused instanceof HTMLSelectElement;
 document.body.classList.toggle('has-editable-focus',editing);
 const viewport=window.visualViewport;
 document.documentElement.style.setProperty('--visual-viewport-height',`${viewport?.height||innerHeight}px`);
 document.documentElement.style.setProperty('--keyboard-inset',`${editing&&viewport?Math.max(0,innerHeight-viewport.height-viewport.offsetTop):0}px`);
};
window.visualViewport?.addEventListener('resize',syncVisualViewport);
window.visualViewport?.addEventListener('scroll',syncVisualViewport);
window.addEventListener('resize',syncVisualViewport);
document.addEventListener('focusin',syncVisualViewport);
document.addEventListener('focusout',()=>requestAnimationFrame(syncVisualViewport));
syncVisualViewport();
document.querySelectorAll('[data-accordion]').forEach(accordion=>accordion.querySelectorAll('details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)accordion.querySelectorAll('details').forEach(other=>{if(other!==item)other.open=false;});})));
document.querySelectorAll('[data-area]').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('[data-area]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  const title = document.querySelector('[data-area-title]');
  if(title && button instanceof HTMLElement) title.textContent=`${button.dataset.area}, NC`;
}));
const form=document.querySelector('#estimate-form');
if(form instanceof HTMLFormElement){
  // The server CSP blocks form submission even if JavaScript is unavailable.
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const fields=['name','phone','email','city','service'];
    /** @type {HTMLElement[]} */
const invalidFields=[];
    fields.forEach(id=>{
      const field=document.getElementById(id),error=document.getElementById(`${id}-error`);
      if(!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement))return;
      let message='';
      if(!field.value.trim())message='Please complete this field.';
      else if(id==='phone' && field.value.replace(/\D/g,'').length<10)message='Enter a phone number with at least 10 digits.';
      else if(!field.validity.valid)message=id==='email'?'Enter a valid email address.':'Please check this field.';
      field.setAttribute('aria-invalid',String(Boolean(message)));
      if(error)error.textContent=message;
      if(message) invalidFields.push(field);
    });
    const status=document.getElementById('form-status');
    const firstInvalid=invalidFields[0];
    if(firstInvalid instanceof HTMLElement){if(status)status.textContent='Check the highlighted fields. Nothing has been sent.';firstInvalid.focus();return;}
    if(status instanceof HTMLElement){status.textContent='Your preview request is complete. Nothing has been sent or saved. Call (919) 592-8328 to request a live estimate.';status.focus();}
  });
  form.addEventListener('input',event=>{
    if(!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement))return;
    event.target.removeAttribute('aria-invalid');
    const error=document.getElementById(`${event.target.id}-error`);if(error)error.textContent='';
    const status=document.getElementById('form-status');if(status)status.textContent='';
  });
}
// The same stacked-card interaction as the agency reference, using YardU quotes.
const reviewStack=document.querySelector('[data-review-stack]');
if(reviewStack instanceof HTMLElement){
 const cards=[...reviewStack.querySelectorAll('[data-review-card]')];
 let active=0;
 const fitStack=()=>{
  const heights=cards.map(card=>card instanceof HTMLElement?card.offsetHeight:0);
  reviewStack.style.height=`${Math.max(...heights,360)+180}px`;
 };
 cards.forEach((card,index)=>{
  const quote=card.querySelector('blockquote');if(!(quote instanceof HTMLElement))return;
  const full=quote.textContent?.trim()||'',words=full.replace(/^[“”]|[“”]$/g,'').split(/\s+/);
  quote.id=`review-copy-${index}`;
  if(words.length>32){
   const preview='“'+words.slice(0,32).join(' ')+'…”',button=document.createElement('button'),label=card.querySelector('.testimonial-source');
   button.className='review-expand';button.type='button';button.textContent='Read full testimonial';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',quote.id);quote.textContent=preview;quote.after(button);if(label)label.textContent='Excerpt · website testimonial';
   button.addEventListener('click',()=>{const expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));button.textContent=expanded?'Show excerpt':'Read full testimonial';quote.textContent=expanded?full:preview;if(label)label.textContent=expanded?'Website testimonial':'Excerpt · website testimonial';fitStack();});
  }
 });
 const update=()=>{
  const cardSpacing=innerWidth<720?160:252;
  cards.forEach((card,index)=>{if(!(card instanceof HTMLElement))return;const position=index-active;card.style.setProperty('--shift',`${position*cardSpacing}px`);card.style.setProperty('--lift',`${position===0?-24:16}px`);card.style.setProperty('--tilt',`${position===0?0:position>0?3:-3}deg`);card.style.setProperty('--depth',String(20-Math.abs(position)));card.classList.toggle('is-active',position===0);card.setAttribute('aria-hidden',String(position!==0));card.tabIndex=position===0?0:-1;card.querySelectorAll('a,button').forEach(link=>{if(link instanceof HTMLElement)link.tabIndex=position===0?0:-1;});});
  const status=reviewStack.querySelector('[data-review-position]');if(status)status.textContent=`Testimonial ${active+1} of ${cards.length}`;
 };
 reviewStack.querySelector('.stack-review-prev')?.addEventListener('click',()=>{active=(active-1+cards.length)%cards.length;update();});
 reviewStack.querySelector('.stack-review-next')?.addEventListener('click',()=>{active=(active+1)%cards.length;update();});
 cards.forEach((card,index)=>card.addEventListener('click',()=>{active=index;update();}));
 window.addEventListener('resize',()=>{update();fitStack();});update();fitStack();document.fonts.ready.then(fitStack);
 const cardObserver=new ResizeObserver(fitStack);cards.forEach(card=>cardObserver.observe(card));
}
document.querySelectorAll('.service-disclosure').forEach(menu=>{
 if(!(menu instanceof HTMLDetailsElement))return;
 const summary=menu.querySelector('summary');
 /** @type {ReturnType<typeof setTimeout> | undefined} */
 let closeTimer;
 const clearClose=()=>{if(closeTimer!==undefined)clearTimeout(closeTimer);};
 const sync=()=>summary?.setAttribute('aria-expanded',String(menu.open));
 const close=()=>{clearClose();menu.open=false;sync();};
 menu.addEventListener('toggle',sync);sync();
 menu.addEventListener('pointerenter',event=>{
  if(event instanceof PointerEvent&&event.pointerType==='mouse'&&innerWidth>1000&&matchMedia('(hover: hover) and (pointer: fine)').matches){clearClose();menu.open=true;sync();}
 });
 menu.addEventListener('pointerleave',()=>{
  clearClose();closeTimer=setTimeout(()=>{if(!menu.contains(document.activeElement))close();},180);
 });
 menu.addEventListener('focusin',clearClose);
 menu.addEventListener('focusout',event=>{if(event instanceof FocusEvent&&!menu.contains(event.relatedTarget instanceof Node?event.relatedTarget:null))close();});
 menu.querySelectorAll('a').forEach(link=>link.addEventListener('click',close));
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){close();summary?.focus();}});
 document.addEventListener('click',event=>{if(event.target instanceof Node&&!menu.contains(event.target))close();});
});
window.addEventListener('pageshow',()=>{
 setMenu(false);
 document.querySelectorAll('.service-disclosure').forEach(menu=>{if(menu instanceof HTMLDetailsElement){menu.open=false;menu.querySelector('summary')?.setAttribute('aria-expanded','false');}});
});
