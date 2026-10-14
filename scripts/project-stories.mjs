import {readFileSync} from 'node:fs';
import {photoComparison} from './photo-comparison.mjs';

// Private provenance stays in the source data; only approved client copy is rendered.
export const projectStories = JSON.parse(readFileSync(new URL('../data/project-stories.json', import.meta.url), 'utf8')).stories;
const escapeHTML = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const defaultImage = file => `/assets/images/${file}`;

const storyHTML = (story, img) => `<section class="project-story hardscape-projects section-pad" id="${escapeHTML(story.id)}" aria-labelledby="${escapeHTML(story.id)}-heading"><div class="shell"><div class="local-content"><p class="eyebrow">${escapeHTML(story.location)}</p><h2 id="${escapeHTML(story.id)}-heading">${escapeHTML(story.heading)}</h2><p>${escapeHTML(story.intro)}</p><p>${escapeHTML(story.detail)}</p></div>${photoComparison(story,img)}<div class="local-content"><h3>${escapeHTML(story.planning_heading)}</h3><p>${escapeHTML(story.planning)}</p><p><a class="text-link" href="/services/${story.id==='north-hills-retaining-wall'?'retaining-walls':story.id==='north-hills-paver-patio'?'paver-patios':'hardscaping'}/">${story.id==='north-hills-retaining-wall'?'Explore retaining wall installation':story.id==='north-hills-paver-patio'?'Explore paver patio installation':'Explore hardscaping services'}</a> · <a class="text-link" href="/services/hardscaping/">All hardscaping</a> · <a class="text-link" href="/getestimate/">Discuss your outdoor project</a></p></div></div></section>`;

export const retainingWallStoryHtml = (img = defaultImage) => storyHTML(projectStories.find(story => story.id === 'north-hills-retaining-wall'), img);
export const patioStoryHtml = (img = defaultImage) => storyHTML(projectStories.find(story => story.id === 'north-hills-paver-patio'), img);
export const projectStoriesHtml = (img = defaultImage) => projectStories.map(story=>storyHTML(story,img)).join('');
