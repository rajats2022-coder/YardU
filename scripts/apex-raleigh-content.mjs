// Both cities are client-confirmed service areas. North Hills project locations
// are user-confirmed in data/project-stories.json; Apex photo locations are unknown.
const contact = city => `<div class="resource-box"><h3>Start with a free property estimate</h3><p><a href="/getestimate/">Request a ${city} estimate</a> or <a href="tel:+19195928328">call (919) 592-8328</a>. Share your address, photos, the work you have in mind, and preferred timing. Contact hours are 7 AM–7 PM every day, including holidays.</p></div>`;
const otherServices = `<p>For additional needs, explore <a href="/services/sod/">sod installation</a>, <a href="/services/pressure-washing/">pressure washing</a>, and <a href="/services/snow-removal/">snow removal</a>. YardU will confirm the scope and availability for each request.</p>`;

export const apexGuide = {
 city:'Apex',slug:'apex',path:'/service-areas/apex/',
 title:'Lawn Care, Mowing & Landscaping in Apex, NC | YardU',
 description:'Lawn mowing, landscaping, mulch installation and fall leaf cleanup in Apex, NC. Explore YardU’s services and request a free estimate for your property.',
 h1:'Lawn care &amp; landscaping<br>in Apex, NC.',
 intro:'Keep the lawn, edges, and landscape beds working together. Talk with YardU about mowing, a property refresh, or fall leaf cleanup at your Apex home.',
 heroImage:'yardu-backyard-lawn.webp',heroAlt:'Backyard lawn beside a home from YardU’s project album',focusedArea:true,
 content:`<h2>Lawn mowing and maintenance for your Apex yard</h2>
 <p>For a lawn that needs regular attention, start with YardU’s <a href="/services/lawn-maintenance/">lawn care and mowing package</a>. The visit combines <a href="/services/mowing/">mowing</a>, <a href="/services/edging/">edging</a>, <a href="/services/trimming/">weed trimming</a>, and <a href="/services/blowing/">blowing off surfaces</a>, so the cut and the finishing details are part of one scope.</p>
 <p>Point out fenced lawn sections, edges beside your driveway, planting beds, and obstacles around trees or play areas. Share the current grass condition and any gate or parking instructions. YardU will confirm the areas to include, visit frequency, available dates, and price before scheduling.</p>
 ${contact('Apex')}
 <h2>Refresh beds, clear leaves, or plan an outdoor project</h2>
 <div class="cary-service-grid">
 <article><h3>Mulch, pine straw and plants</h3><p>For beds that need a fresh finish, explore <a href="/services/mulch-straw-rock/">mulch, pine straw, and rock installation</a>. Pair your material request with <a href="/services/plant-installs/">plant installation</a> when you want to change what grows in the space.</p></article>
 <article><h3>Fall leaves and property cleanups</h3><p>Describe leaf buildup on the lawn, in beds, and along fences for <a href="/services/leaf-debris-removal/">leaf removal</a>. If several areas need attention, request a <a href="/services/property-cleanups/">property cleanup</a> and agree on collection and removal arrangements.</p></article>
 <article><h3>Patios, retaining walls and drainage</h3><p>Discuss <a href="/services/hardscaping/">hardscaping</a>, including <a href="/services/paver-patios/">paver patios</a> and <a href="/services/retaining-walls/">retaining walls</a>. For soggy areas or runoff concerns, share photos for a <a href="/services/drainage/">yard drainage</a> conversation.</p></article>
 <article><h3>Seasonal requests</h3><p>Ask about <a href="/services/aeration-overseeding/">aeration and overseeding</a> based on your lawn’s grass type. For the holidays, discuss the layout, supplied lights, and preferred dates for <a href="/services/christmas-light-installs/">Christmas light installation</a>.</p></article>
 </div>${otherServices}
 <h2>Plan leaf handling around Apex’s collection changes</h2>
 <p>Apex’s <a href="https://www.apexnc.org/563/Yard-Waste-Collection">official yard waste guidance</a> announces biweekly collection beginning October 19, 2026, with assigned collection zones. It also states that contractor-generated yard waste must be disposed of by the contractor or landscaper.</p>
 <p>When requesting a cleanup, agree with YardU on collection, hauling, and disposal for the actual job. Surface clearing after mowing is a different scope from removing accumulated leaves and debris. Check the town’s current guidance before arranging material for municipal pickup.</p>
 <h2>See the details in YardU’s work</h2>
 <p>These examples come from YardU’s shared project album across its service area.</p>
 <div class="cary-work-grid"><figure><img src="/assets/images/yardu-backyard-lawn.webp" width="1200" height="1600" loading="lazy" alt="Backyard lawn beside a home in YardU’s project album"><figcaption>A backyard lawn from the YardU project album.</figcaption></figure><figure><img src="/assets/images/yardu-driveway-pine-straw-bed.webp" width="1200" height="1600" loading="lazy" alt="Pine straw in a landscape bed beside a driveway from YardU’s project album"><figcaption>A pine straw bed beside a driveway, from YardU’s album.</figcaption></figure></div>
 <p><a href="/projects/">View the YardU project gallery</a> or <a href="https://www.google.com/maps?cid=9787269376349729307" target="_blank" rel="noopener">read customer reviews on Google</a>.</p>
 <h2>Property care with a purpose</h2>
 <p>YardU’s work gives young people opportunities to practice responsibility, communication, and professionalism. Founder Jackson DeSilva is an NC State football alumnus. <a href="/our-mission/">Learn about Landscaping with a Purpose</a> and the mission behind the work.</p>
 <p>Apex is a confirmed service area. YardU visits customer properties and confirms availability for your address. Share community access rules, pets, and locked gates before a visit. For grass-specific maintenance advice, see <a href="https://content.ces.ncsu.edu/catalog/series/227/lawn-maintenance-calendars">NC State Extension’s lawn calendars</a>.</p>
 <p>Have another property nearby? Explore <a href="/service-areas/cary/">Cary lawn care</a>, <a href="/service-areas/raleigh/">Raleigh lawn care and landscaping</a>, or the <a href="/service-areas/">full service area</a>.</p>`,
 faqs:[
 ['What does lawn mowing in Apex include?','YardU’s core package includes mowing, edging, weed trimming, and blowing off surfaces. The estimate confirms which lawn areas and surfaces are included, along with frequency, access, timing, and price.'],
 ['Can YardU remove leaves instead of leaving them for town collection?','Request leaf removal and explain the material and areas involved. Agree on collection, hauling, disposal, and price with YardU. Apex’s town guidance says contractor-generated yard waste must be disposed of by the contractor or landscaper.'],
 ['Can I combine lawn care with mulch or planting work?','Describe both needs in your estimate request. Mowing, bed materials, and plant installation have different scopes; YardU will confirm the included work, materials, and scheduling.'],
 ['What does an Apex lawn care estimate cost?','YardU offers free estimates. Share your address, approximate lawn size, condition, photos, and access details so the team can discuss a price for the work.'],
 ['How do I arrange holiday lighting at my home?','Request Christmas light installation and describe your home, preferred layout, supplied lights, and dates. YardU will confirm scope and availability before scheduling.']
 ]
};

export const raleighGuide = {
 city:'Raleigh',path:'/service-areas/raleigh/',
 title:'Lawn Care, Mowing & Landscaping in Raleigh, NC | YardU',
 description:'Raleigh lawn care, mowing, landscaping and leaf removal from YardU. See confirmed North Hills patio and retaining-wall work and request a free estimate.',
 h1:'Lawn care &amp; landscaping<br>in Raleigh, NC.',
 intro:'Care for your lawn, refresh the landscape, or plan an outdoor space. Explore YardU’s services and real North Hills projects, then tell us about your Raleigh property.',
 heroImage:'yardu-tree-lined-striped-lawn.webp',heroAlt:'Tree-lined striped lawn photographed for YardU’s project album',focusedArea:true,projectProof:true,
 content:`<h2>Raleigh lawn care from mowing to the final cleanup</h2>
 <p>YardU’s <a href="/services/lawn-maintenance/">lawn care and mowing package</a> covers the cut and the details around it. It combines <a href="/services/mowing/">mowing</a>, <a href="/services/edging/">edging</a>, <a href="/services/trimming/">weed trimming</a>, and <a href="/services/blowing/">blowing off surfaces</a> in one agreed scope.</p>
 <p>Tell the team about your grass condition, slopes, shade, fenced sections, and edges along walks or planting beds. For ongoing maintenance or a first visit, YardU will confirm the included areas, access, frequency, price, and schedule for your address.</p>
 ${contact('Raleigh')}
 <h2>Landscaping and outdoor improvements</h2>
 <p>A lawn visit and a landscape project call for different planning. Choose the service that fits your goal and share photos so the team can discuss preparation, materials, and access.</p>
 <div class="cary-service-grid">
 <article><h3>Landscape beds and plants</h3><p>Refresh existing beds with <a href="/services/mulch-straw-rock/">mulch, pine straw, or decorative rock</a>. Discuss <a href="/services/plant-installs/">plant installation</a> for areas where you want to change the planting.</p></article>
 <article><h3>Paver patios and retaining walls</h3><p>Explore <a href="/services/hardscaping/">hardscaping</a> for your outdoor space, including <a href="/services/paver-patios/">paver patios</a> and <a href="/services/retaining-walls/">retaining walls</a>. The North Hills examples below show YardU work at real Raleigh properties.</p></article>
 <article><h3>Leaf removal and yard cleanup</h3><p>Arrange <a href="/services/leaf-debris-removal/">leaf removal</a> for accumulated leaves, or a broader <a href="/services/property-cleanups/">yard cleanup</a>. Describe the areas involved and confirm handling and removal in your estimate.</p></article>
 <article><h3>Drainage and seasonal care</h3><p>Share standing-water concerns for <a href="/services/drainage/">yard drainage</a>, discuss <a href="/services/aeration-overseeding/">aeration and overseeding</a> for your grass type, or request dates for <a href="/services/christmas-light-installs/">Christmas light installation</a>.</p></article>
 </div>${otherServices}
 <h2>Plan fall cleanup with Raleigh’s current leaf guidance</h2>
 <p>Raleigh replaced seasonal loose-leaf collection with weekly yard waste pickup on September 8, 2026. The city’s <a href="https://raleighnc.gov/landfill-and-reuse/services/leaf-collection-options">leaf collection options</a> explain current preparation methods. Check the city’s <a href="https://raleighnc.gov/landfill-and-reuse/services/garbage-recycling-and-yard-waste-preparation">waste preparation guidance</a> for rules affecting contracted work.</p>
 <p>Discuss removal and disposal with YardU when arranging leaf or property cleanup. Clearing clippings from a walk after mowing is different from handling existing leaf buildup across a property.</p>
 <h2>Local lawn planning and YardU’s mission</h2>
 <p>Grass type affects the care calendar. Use <a href="https://content.ces.ncsu.edu/catalog/series/227/lawn-maintenance-calendars">NC State Extension’s lawn maintenance calendars</a> for your actual turf and bring any irrigation, shade, or access questions to YardU. The educational calendars cover care beyond the mowing package.</p>
 <p>Founded by Jackson DeSilva, an NC State football alumnus, YardU helps young people learn work ethic, communication, and responsibility through property care. <a href="/our-mission/">Read about Landscaping with a Purpose</a> or <a href="https://www.google.com/maps?cid=9787269376349729307" target="_blank" rel="noopener">read customer reviews on Google</a>.</p>
 <h2>See YardU projects in North Hills, Raleigh</h2>
 <p>These retaining-wall and patio projects are in Raleigh’s North Hills area. Compare the visible materials, layout, and finishing details, then discuss what fits your own yard. <a href="/projects/">Browse the full YardU project gallery</a>.</p>
 <p>YardU travels to customer properties across its confirmed service area. For another address, explore <a href="/service-areas/cary/">Cary</a>, <a href="/service-areas/apex/">Apex</a>, or the <a href="/service-areas/">service area hub</a>. Confirm the property and requested work directly with the team.</p>`,
 faqs:[
 ['Can I arrange recurring lawn mowing in Raleigh?','Tell YardU whether you need ongoing lawn maintenance or help with a first visit. The core package includes mowing, edging, weed trimming, and blowing off surfaces. Confirm frequency, included areas, price, and availability before scheduling.'],
 ['Has YardU completed projects in Raleigh?','Yes. The North Hills examples on this page show confirmed YardU retaining-wall and paver-patio projects in Raleigh. You can view the before-and-after photos and explore the related service pages.'],
 ['Is leaf removal included with mowing?','Seasonal leaf removal and broader property cleanups are separate from routine mowing and surface clearing. Describe existing leaf buildup and confirm collection, hauling, and disposal in the estimate.'],
 ['How much does Raleigh lawn care or landscaping cost?','YardU offers a free estimate for your property and requested work. Share your address, photos, approximate dimensions, current condition, and access details. Materials, preparation, included work, and price are agreed before booking.'],
 ['Can YardU help with a patio, retaining wall, or drainage concern?','Describe your goal and share photos of the space, slopes, access, and any standing water. YardU will discuss the appropriate scope, materials, site requirements, estimate, and schedule for the project.']
 ]
};
