import {readFileSync} from 'node:fs';

// Private provenance stays in the source data; only approved client copy is rendered.
export const projectStories = JSON.parse(readFileSync(new URL('../data/project-stories.json', import.meta.url), 'utf8')).stories;
const escapeHTML = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const defaultImage = file => `/assets/images/${file}`;

const figureHTML = (photo, img, className = '') => `<figure${className ? ` class="${className}"` : ''}><a href="${escapeHTML(img(photo.file))}" target="_blank" rel="noopener" aria-label="View full photo: ${escapeHTML(photo.label)}"><img src="${escapeHTML(img(photo.file))}" alt="${escapeHTML(photo.alt)}" width="${photo.width}" height="${photo.height}" loading="lazy" decoding="async"></a><figcaption><span>${escapeHTML(photo.label)}</span><p>${escapeHTML(photo.caption)}</p></figcaption></figure>`;

const storyHTML = (story, img) => `<section class="project-story hardscape-projects section-pad" id="${escapeHTML(story.id)}" aria-labelledby="${escapeHTML(story.id)}-heading"><div class="shell"><div class="local-content"><p class="eyebrow">${escapeHTML(story.location)}</p><h2 id="${escapeHTML(story.id)}-heading">${escapeHTML(story.heading)}</h2><p>${escapeHTML(story.intro)}</p><p>${escapeHTML(story.detail)}</p></div>${story.images.length > 1 ? `<div class="hardscape-comparison">${story.images.map(photo => figureHTML(photo, img)).join('')}</div>` : figureHTML(story.images[0], img, 'hardscape-album-comparison')}<div class="local-content"><h3>${escapeHTML(story.planning_heading)}</h3><p>${escapeHTML(story.planning)}</p><p><a class="text-link" href="/services/hardscaping/">Explore YardU hardscaping</a> · <a class="text-link" href="/getestimate/">Discuss your outdoor project</a></p></div></div></section>`;

export const retainingWallStoryHtml = (img = defaultImage) => storyHTML(projectStories.find(story => story.id === 'north-hills-retaining-wall'), img);
export const patioStoryHtml = (img = defaultImage) => storyHTML(projectStories.find(story => story.id === 'north-hills-paver-patio'), img);
export const projectStoriesHtml = (img = defaultImage) => retainingWallStoryHtml(img) + patioStoryHtml(img);
