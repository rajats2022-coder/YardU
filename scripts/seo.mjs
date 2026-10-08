import {googleProfile} from './google-profile.mjs';
const origin='https://hireyardu.com';
const serviceAreas=['Raleigh','Cary','Apex','Wake Forest','Fuquay-Varina','Holly Springs'].map(name=>({'@type':'City',name:name+', North Carolina'}));
export const breadcrumbsFor=(page)=>{
 const items=[{name:'Home',path:'/'}];
 if(page.path==='/')return [];
 if(page.path.startsWith('/services/'))items.push({name:'Services',path:'/services-2/'});
 if(page.path.startsWith('/service-areas/'))items.push({name:'Service Areas',path:'/service-areas/'});
 if(!items.some(item=>item.path===page.path))items.push({name:page.city||page.component||({'/services-2/':'Services','/services/lawn-maintenance/':'The YardU Special','/our-mission/':'Our Mission','/meet-the-founders/':'Meet Jackson','/projects/':'Gallery','/reviews/':'Testimonials','/getestimate/':'Estimate','/404/':'Page Not Found'}[page.path]),path:page.path});
 return items;
};
export const breadcrumbHTML=(page)=>{
 const items=breadcrumbsFor(page);return items.length?`<nav class="shell breadcrumbs" aria-label="Breadcrumb"><ol>${items.map((item,index)=>`<li>${index===items.length-1?`<span aria-current="page">${item.name}</span>`:`<a href="${item.path}">${item.name}</a>`}</li>`).join('')}</ol></nav>`:'';
};
export const structuredData=(page)=>{
 const graph=[{'@type':'Organization','@id':origin+'/#organization',name:'YardU',url:origin,areaServed:serviceAreas,logo:origin+'/assets/images/yardu-logo.svg',image:origin+'/assets/images/client-truck.webp',telephone:'+19195928328',email:'jackson@hireyardu.com',founder:{'@type':'Person',name:'Jackson DeSilva',jobTitle:'Founder'},sameAs:[googleProfile.googleReviewsUrl,'https://www.instagram.com/theyarduniversity/','https://www.linkedin.com/company/yardu']},{'@type':'WebSite','@id':origin+'/#website',name:'YardU',url:origin,publisher:{'@id':origin+'/#organization'}},{'@type':'WebPage','@id':origin+page.path+'#webpage',url:origin+page.path,name:page.title,description:page.description,isPartOf:{'@id':origin+'/#website'}}];
 const breadcrumbs=breadcrumbsFor(page);if(breadcrumbs.length)graph.push({'@type':'BreadcrumbList',itemListElement:breadcrumbs.map((item,index)=>({'@type':'ListItem',position:index+1,name:item.name,item:origin+item.path}))});
 if(page.path==='/services/lawn-maintenance/'||page.service)graph.push({'@type':'Service',name:page.component||'The YardU Special',serviceType:page.component||'Lawn mowing and maintenance',description:page.description,provider:{'@id':origin+'/#organization'},url:origin+page.path,'@id':origin+page.path+'#service',areaServed:serviceAreas});
 const webPage=graph.find(node=>node['@type']==='WebPage');
 if(page.city)webPage.about={'@type':'City',name:page.city+', North Carolina'};
 if(breadcrumbs.length){const breadcrumb=graph.find(node=>node['@type']==='BreadcrumbList');breadcrumb['@id']=origin+page.path+'#breadcrumb';webPage.breadcrumb={'@id':breadcrumb['@id']};}
 const service=graph.find(node=>node['@type']==='Service');if(service)webPage.mainEntity={'@id':service['@id']};
 // Contact hours are plain text only: weekdays are unconfirmed. No address or rating claims.
 return `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c')}</script>`;
};
