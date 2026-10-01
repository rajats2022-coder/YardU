// Reuses the agency MapLibre component with public town centers only.
const mapRoot=document.querySelector('[data-area-map]');
if(mapRoot instanceof HTMLElement){
 const signals=[...mapRoot.querySelectorAll('[data-area-signal]')];
 const links=[...document.querySelectorAll('[data-area-select]')];
 const canvas=mapRoot.querySelector('[data-map-canvas]');
 const state=mapRoot.querySelector('[data-map-load-state] strong');
 let serviceMap;
 const activate=(signal)=>{
  if(!(signal instanceof HTMLElement))return;
  signals.forEach(item=>{item.classList.toggle('is-active',item===signal);item.setAttribute('aria-pressed',String(item===signal));});
  links.forEach(link=>{if(link instanceof HTMLElement)link.classList.toggle('is-active',link.dataset.areaSelect===signal.dataset.areaSlug);});
  const name=mapRoot.querySelector('[data-map-area-name]'),detail=mapRoot.querySelector('[data-map-area-link]');
  if(name)name.textContent=signal.dataset.areaName+', NC';
  if(detail instanceof HTMLAnchorElement){detail.href=signal.dataset.areaHref||'/service-areas/';const label=detail.querySelector('span');if(label)label.textContent='Explore '+signal.dataset.areaName;}
 };
 links.forEach(link=>['pointerenter','focus'].forEach(event=>link.addEventListener(event,()=>{if(link instanceof HTMLElement)activate(signals.find(s=>s instanceof HTMLElement&&s.dataset.areaSlug===link.dataset.areaSelect));})));
 signals.forEach(signal=>['click','focus','pointerenter'].forEach(event=>signal.addEventListener(event,()=>activate(signal))));
 const views=[...mapRoot.querySelectorAll('[data-map-view]')];
 const fit=(view,duration=650)=>{
  views.forEach(button=>{if(button instanceof HTMLElement){const selected=button.dataset.mapView===view;button.setAttribute('aria-pressed',String(selected));button.classList.toggle('is-active',selected);}});
  serviceMap?.fitBounds(view==='state'?[[-84.45,33.72],[-75.3,36.7]]:[[-79.02,35.48],[-78.37,36.09]],{padding:38,maxZoom:view==='state'?6.6:8.8,duration:matchMedia('(prefers-reduced-motion: reduce)').matches?0:duration});
 };
 views.forEach(button=>button.addEventListener('click',()=>{if(button instanceof HTMLElement)fit(button.dataset.mapView);}));
 const load=async()=>{
  try{
   const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='/assets/vendor/maplibre-gl.css';
   await Promise.all([new Promise((resolve,reject)=>{stylesheet.onload=resolve;stylesheet.onerror=reject;document.head.append(stylesheet);}),import('./vendor/maplibre-gl.mjs')]);
   const maplibregl=await import('./vendor/maplibre-gl.mjs');
   serviceMap=new maplibregl.Map({container:canvas,style:'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',center:[-78.77,35.79],zoom:8.4,minZoom:5.3,maxZoom:16,renderWorldCopies:false,pitchWithRotate:false,attributionControl:false});
   serviceMap.addControl(new maplibregl.AttributionControl({compact:true}),'bottom-right');
   serviceMap.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
   signals.forEach(signal=>{if(!(signal instanceof HTMLElement))return;new maplibregl.Marker({element:signal,anchor:'center'}).setLngLat([Number(signal.dataset.areaLongitude),Number(signal.dataset.areaLatitude)]).addTo(serviceMap);});
   serviceMap.on('load',()=>{mapRoot.classList.add('is-map-loaded');fit('service',0);});
   serviceMap.on('error',()=>{if(!mapRoot.classList.contains('is-map-loaded')&&state)state.textContent='Map tiles unavailable — use the city guides';});
  }catch{if(state)state.textContent='Map unavailable — use the city guides';mapRoot.classList.add('map-fallback');}
 };
 if(canvas){const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();load();}},{rootMargin:'300px'});observer.observe(mapRoot);}
}
