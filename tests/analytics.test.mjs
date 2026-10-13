import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
const source = await readFile(new URL('../assets/analytics.js',import.meta.url),'utf8');
function run({hostname='hireyardu.com',privacy=false,dnt='0',search='?email=customer%40example.com&token=private',path='/services/hardscaping/'}={}) {
 const listeners={},scripts=[],timers=[],navigations=[]; class Element {constructor(href){this.href=href;} closest(){return this;} getAttribute(){return this.href;}}
 const context={location:{hostname,origin:'https://'+hostname,pathname:path,search,assign:href=>navigations.push(href)},navigator:{globalPrivacyControl:privacy,doNotTrack:dnt},window:{},setTimeout:fn=>timers.push(fn),URL,URLSearchParams,Element,document:{referrer:'https://example.org/?email=private@example.org',head:{append:s=>scripts.push(s)},createElement:()=>({}),addEventListener:(n,f)=>listeners[n]=f}};
 vm.runInNewContext(source,context);return {context,scripts,timers,navigations,click:(href,extra={})=>listeners.click?.({target:new Element(href),...extra}),events:()=>Array.from(context.window.dataLayer||[],x=>Array.from(x))};
}
test('Traffic payload strips customer query values and referrer query values',()=>{
 const state=run();assert.equal(state.scripts.length,1);const config=state.events().find(x=>x[0]==='config')[2];assert.equal(config.page_location,'https://hireyardu.com/services/hardscaping/');assert.equal(config.page_referrer,'https://example.org');assert.equal(config.allow_google_signals,false);assert.equal(config.allow_ad_personalization_signals,false);assert.ok(!JSON.stringify(state.events()).includes('customer'));
});
test('Contact intent is separate from form completion and excludes contact details',()=>{
 const state=run();for(const href of ['tel:+19195928328','sms:+19195928328','mailto:jackson@hireyardu.com','/getestimate/','/services/sod/'])state.click(href);
 const events=state.events().filter(x=>x[0]==='event');assert.deepEqual(events.map(x=>x[1]),['phone_click','text_click','email_click','estimate_click']);assert.ok(!JSON.stringify(events).includes('919592'));assert.ok(!JSON.stringify(events).includes('jackson'));assert.ok(!events.some(x=>x[1]==='generate_lead'));
});
test('Local previews and privacy signals do not start Analytics',()=>{
 for(const options of [{hostname:'localhost'},{privacy:true},{dnt:'1'}]){const state=run(options);assert.equal(state.scripts.length,0);assert.equal(state.events().length,0);}
});
test('Only the configured public GBP campaign is accepted, and self-links on estimate page do not create new intent',()=>{
 const state=run({search:'?utm_source=google&utm_medium=organic&utm_campaign=gbp&name=Private',path:'/getestimate/'});const config=state.events().find(x=>x[0]==='config')[2];assert.equal(config.campaign_name,'gbp');assert.ok(!JSON.stringify(config).includes('Private'));state.click('/getestimate/');assert.equal(state.events().filter(x=>x[0]==='event').length,0);
});

test('Estimate navigation waits for dispatch but has a bounded fallback and preserves modified clicks',()=>{
 const state=run();let prevented=false;state.click('/getestimate/',{button:0,preventDefault:()=>prevented=true});assert.equal(prevented,true);assert.deepEqual(state.navigations,[]);
 const payload=state.events().find(x=>x[0]==='event')[2];payload.event_callback();state.timers[0]();assert.deepEqual(state.navigations,['/getestimate/']);
 const blocked=run();blocked.click('/getestimate/',{button:0,preventDefault:()=>{}});blocked.timers[0]();assert.deepEqual(blocked.navigations,['/getestimate/']);
 const modified=run();modified.click('/getestimate/',{button:0,metaKey:true,preventDefault:()=>assert.fail('Modified navigation should remain native')});assert.equal(modified.timers.length,0);
});
