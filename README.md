# YardU website review

Static, responsive YardU website using its authentic public brand/assets and verified services/communities. This source snapshot is for review; it does not deploy the site or enable indexing, lead delivery, tracking or an AI provider.

## Run

Node.js 22.19 or newer (verified locally with 25.9).

```sh
npm ci --ignore-scripts
npm run build
npm run dev
```

Open http://localhost:4319/. Generated files are in `dist/`, excluded from Git. The server binds loopback only and retains preview noindex/robots controls.

## Vercel build settings

The root `vercel.json` sets Framework Preset **Other**, Build Command **npm run build**, and Output Directory **dist**. Select the repository root (leave Root Directory empty), use **npm ci --ignore-scripts** if overriding the install command, and use Node.js **22.x** or newer. If the dashboard still shows an Output Directory override of `public`, change it to `dist` or remove the override. Redeploy the commit containing `vercel.json`, rather than rerunning the older commit.

This is a static multi-page build. Vercel uses the generated directory `index.html` files and `404.html`; there is no homepage catch-all rewrite. The configuration includes the four temporary 302 aliases (with and without trailing slash), trailing-slash normalization, and the existing noindex/nosniff/CSP headers. These rules are Vercel configuration, not Netlify `_redirects` or `_headers` files. Verify actual statuses, headers and paths on the user's deployment; local build checks do not prove a live Vercel deployment.

The loopback Node server and its `/api/chat` endpoint are not deployed by this static configuration. If the endpoint is unavailable, the guide shows its services/phone fallback; the estimate draft still works in the tab. No provider credentials, API functions or lead delivery are enabled. The estimate form remains disconnected. Preview robots/meta/header indexing blocks also remain in force.

## Verify

```sh
npm run lint
npm run typecheck
npm run test
npm run test:chat
node scripts/verify.mjs --http
```

Start the preview for HTTP/browser audits. Lighthouse 13.5.0 and axe-core 4.13.0 are pinned developer tools. `npm run test:lighthouse` uses an existing Chrome/Chromium browser, selected with `YARDU_CHROMIUM_PATH` when needed. Playwright browser checks use an existing installation via `YARDU_PLAYWRIGHT_MODULE` and `YARDU_CHROMIUM_PATH`; this repository does not download a duplicate browser. Available scripts include `test:browser`, `test:accessibility`, `test:reviews` and `test:logo`.

QA-RESULTS.md records actual scores, lab limitations and remaining launch checks. SEO-COVERAGE-AUDIT.md records generated headings, schema and the 54 bidirectional service/component–town links. url-registry.json freezes proposed paths; media-migration-plan.json records original media preservation decisions. Raw reports/screenshots, private audits, local Library records and credentials are excluded.

## Review content and integrations

The exact YardU Google profile is https://www.google.com/maps?cid=9787269376349729307. The user-provided October 1 screenshot verifies aggregate 5.0/89. That dated snapshot is displayed separately from the website testimonials. Google sign-in prevented public individual-review access; no new Google quotes are fabricated or represented as live synchronization. Review cards use normal content flow, adaptive height, labelled expandable excerpts and original-source links. No self-serving rating/review schema is added.

The original SVG is retained. A presentation derivative shifts only its viewBox to center the visible mark/tagline; paths and shapes are unchanged. The hero uses one complete logo, with a clipped subtle shine disabled for reduced-motion preferences. Responsive AVIF/WebP derivatives preserve the same source photos. Google Fonts and MapLibre licenses remain alongside their assets.

Ask YardU is a verified service guide and local estimate draft. The optional Groq server adapter defaults off and is tested with mocks only. Raw messages and personal/draft details stay in the tab; only fixed service tags reach the local endpoint. Credentials and lead routing are deferred. The estimate form sends and saves nothing.

Before an authorized launch: approve entity/GBP facts and Page Map, preserve and implement approved direct legacy/media redirects, connect and verify lead delivery/consent, validate live schema/rendering, deliberately change noindex headers/meta/robots/sitemap, and verify production/field performance. No public deployment, DNS or index submission is part of this source push.
