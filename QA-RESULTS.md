# YardU website verification — October 1, 2026

The local website’s technical SEO foundation is ready for review. The final source has 23 pages (22 substantive), verified public YardU offerings and service communities, unique metadata, intentional heading hierarchy, 54 bidirectional service/component–town links, connected entity/breadcrumb/service schema, stable legacy slugs, true 404 handling, and an explicit migration inventory. No thin city×service matrix or invented offices/reviews were added.

The preview deliberately blocks indexing. All Lighthouse SEO failures are solely `is-crawlable`: noindex meta/header and review robots block. Other applicable Lighthouse SEO audits pass. Its raw score is **69**, not an indexable-production SEO score. Indexing, approved permanent redirects/media preservation, live schema/render checks, GSC/GBP permissions and authorized lead delivery remain launch work. There is no ranking or Core Web Vitals guarantee.

## Actual Lighthouse results

Lighthouse **13.5.0**, existing isolated Chromium, loopback preview; standard mobile simulated slow-4G/4× CPU, and desktop 1350×940 at 1× CPU/10 Mbps. These are local lab runs; they do not measure production hosting/CDN or field users. Scores vary between runs. Affected home/mission/review templates were rerun after the final review-card fix; desktop/mobile home were rerun again after the final hero-logo refinement.

| Mobile route | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| / | 97 | 100 | 100 | 69 | 2.49s | 0.0008 |
| /getestimate/ | 97 | 100 | 100 | 69 | 2.41s | 0.0009 |
| /our-mission/ | 99 | 100 | 100 | 69 | 2.11s | 0.0009 |
| /projects/ | 96 | 100 | 100 | 69 | 2.71s | 0.0009 |
| /reviews/ | 97 | 100 | 100 | 69 | 2.42s | 0.0009 |
| /service-areas/ | 97 | 100 | 100 | 69 | 2.42s | 0.0009 |
| /service-areas/fuquay-varina/ | 97 | 100 | 100 | 69 | 2.41s | 0.0009 |
| /services-2/ | 92 | 100 | 100 | 69 | 3.25s | 0.0009 |
| /services/lawn-maintenance/ | 97 | 100 | 100 | 69 | 2.56s | 0.0009 |
| /services/leaf-debris-removal/ | 97 | 100 | 100 | 69 | 2.41s | 0.0009 |

Desktop home, lawn-package and estimate templates score **100 performance, 100 accessibility, 100 best practices, 69 SEO**. Their LCP values are 0.72s, 0.68s and 0.60s. Mobile performance spans **92–99**. Some simulated mobile LCP values remain above 2.5s, especially the hub; a high overall score is not a field CWV pass.

The baseline homepage/lawn mobile scores were 72/63. Fixes: compressed self-hosted WOFF2 fonts (two files, 56.8KB), responsive AVIF with WebP fallback, discoverable priority hero images, gzip text responses, minified CSS, deferred MapLibre CSS/import, and removal of a missing inherited image request. Preview noindex controls were preserved throughout.

## Final verification

| Check | Result |
| --- | --- |
| Build, syntax lint, TypeScript checkJs | Passed |
| Static routes/assets/metadata/isolation | 2,911 assertions passed |
| SEO heading/link/schema/URL audit | 793 assertions; 54 bidirectional main-content pairs |
| HTTP/HEAD checks | 2,984 total assertions passed; real 404, 302 preview aliases, submission blocked, noindex headers |
| Responsive/interactions | 132 route/width combinations: all 22 pages at 320/390/768/960/1280/1440px; navigation, map, reviews and disconnected fake-form validation passed |
| Full axe-core 4.13.0 | 58 route/state runs, zero automated violations; 1,080 image/gradient/manual-review observations, which are not automated passes |
| Review-card regression | 36 real/synthetic geometry states at all six widths; author/quote/actions separated, long names and expanded 160-sentence fixtures fit, keyboard next/previous and expand/collapse passed; zero targeted axe violations or page errors |
| Logo alignment | Five header/footer/hero desktop/mobile placements: square badge, centered object-fit and visible bounds centered at 249.5/500; original SVG geometry unchanged, only derived viewBox framing |
| Hero logo and motion | One complete logo, no duplicate adjacent tagline; clipped 12-second shine; reduced-motion disables animation; identical badge geometry in both motion settings |
| Guide/privacy | 14 mock/HTTP tests passed; fixed tags only, no raw message/contact/draft sent to provider, no lead requests or live Groq calls; credentials/configuration deferred |

The earlier services white-on-white defect and red photo caption are corrected and remain covered by rendered contrast checks/manual evidence. The review-overlap root cause was fixed with normal content flow and auto-sized cards/stage, not hidden author rows. Longer quotes have word-boundary excerpts, labelled as excerpts, with an expand control and original-source link.

## Verified Google profile and remaining review input

[YardU on Google Maps](https://www.google.com/maps?cid=9787269376349729307) is the exact profile, matching `hireyardu.com` and (919) 592-8328. Public local-browser readback confirmed identity; the user’s October 1 Google screenshot verifies **5.0 from 89 reviews**. The hero Google button, per-card generic profile links, section CTA and Organization sameAs use this CID. The aggregate is a dated static snapshot, with no live synchronization and no self-serving Review/AggregateRating schema.

Google’s public browser view requires sign-in to read individual reviews. No login/account/CAPTCHA bypass was attempted. The existing cards remain explicitly website testimonials; no new Google quotes were invented. Genuine additional Google quote cards need a verified export or user-provided author/text/rating/date and source link. Hours remain omitted because the sources conflict.

Chat credentials and lead routing are deferred at the user’s request. No deployment, DNS change, indexing submission, GBP edit, real form submission, paid service or provider call was performed. The authorized GitHub delivery is a clean public source snapshot on a review branch, excluding private audit notes, local Library metadata, raw evidence, credentials and caches.
