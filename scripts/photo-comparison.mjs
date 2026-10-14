const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

// Supplied labeled composites are displayed as two halves using CSS;
// the original file remains intact and available beneath the comparison.
export function photoComparison(story, img) {
 const composite = story.images.length === 1;
 const before = story.images[0];
 const after = composite ? before : story.images[1];
 const layer = (photo, side) => composite
  ? `<div class="comparison-photo comparison-composite comparison-composite-${side}" role="img" aria-label="${escape(story.comparison_alts[side])}" style="background-image:url('${escape(img(photo.file))}')"></div>`
  : `<img class="comparison-photo" src="${escape(img(photo.file))}" alt="${escape(photo.alt)}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async">`;
 return `<figure class="photo-comparison${story.comparison_portrait?' comparison-portrait':''}" data-photo-comparison style="--reveal:50%"><div class="comparison-stage"><div class="comparison-layer comparison-after">${layer(after,'after')}</div><div class="comparison-layer comparison-before">${layer(before,'before')}</div><span class="comparison-label comparison-label-before">Before</span><span class="comparison-label comparison-label-after">After</span><span class="comparison-divider" aria-hidden="true"><span>↔</span></span><input hidden class="comparison-range" type="range" min="0" max="100" value="50" step="1" aria-label="Compare before and after: ${escape(story.heading)}" aria-describedby="${escape(story.id)}-comparison-caption"></div><figcaption id="${escape(story.id)}-comparison-caption"><strong>Before &amp; after</strong><p>${escape(story.comparison_caption)} Photos show different viewpoints of the same project.</p><p class="comparison-hint" hidden>Drag the divider or use the arrow keys to compare.</p><div class="comparison-controls" hidden><button type="button" data-comparison-view="100">Show before</button><button type="button" data-comparison-view="50">Compare</button><button type="button" data-comparison-view="0">Show after</button></div><p class="comparison-originals">${composite?`<a href="${escape(img(before.file))}" target="_blank" rel="noopener">View original comparison photo</a>`:`<a href="${escape(img(before.file))}" target="_blank" rel="noopener">View original before photo</a> · <a href="${escape(img(after.file))}" target="_blank" rel="noopener">View original after photo</a>`}</p></figcaption></figure>`;
}
