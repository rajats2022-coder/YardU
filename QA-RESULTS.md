# YardU website verification — October 1, 2026

The ZS-inspired YardU redesign is ready for review. It contains 26 routes (25 substantive pages), all six distinct service-area guides, seven service groups and four lawn-package component guides. Confirmed YardU branding, client photos, Jackson's sole-founder credit, contact details, property cleanups, sod and pine straw are incorporated. DJ Burns' existing testimonial is first, with its authentic YardU-site photo and official NC State link. The service-card hover/title defect and inherited card widths are corrected.

## Actual final Lighthouse results

Lighthouse 13.5.0 used the existing isolated Chromium browser and loopback preview. The redesign baseline measurements ran serially after other YardU browser audits closed at commit fff8e9f, before the focused mobile-bar and trust-card refinements below. Mobile uses standard simulated slow-4G/4× CPU; desktop uses 1350×940 at 1× CPU/10 Mbps. These are local lab results, not production/CDN or field measurements, and are not a Core Web Vitals or ranking guarantee. Earlier runs with concurrent QA load varied substantially; the table records the final serial run.

| Mobile route | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| / | 99 | 100 | 100 | 69 | 1.98s | 0.0000 |
| /services-2/ | 99 | 100 | 100 | 69 | 2.19s | 0.0000 |
| /services/property-cleanups/ | 98 | 100 | 100 | 69 | 2.35s | 0.0000 |
| /services/sod/ | 95 | 100 | 100 | 69 | 2.94s | 0.0000 |
| /meet-the-founders/ | 99 | 100 | 100 | 69 | 1.82s | 0.0000 |
| /reviews/ | 99 | 100 | 100 | 69 | 2.06s | 0.0000 |

Desktop homepage: **100 performance, 100 accessibility, 100 best practices, 69 SEO**; LCP 0.70s, CLS 0. Mobile performance is 95–99 on the six measured templates. Sod's simulated LCP remains above 2.5 seconds despite its overall score. Fonts are self-hosted Poppins (five Latin WOFF2 weights, approximately 39KB), images use responsive AVIF/WebP, the hero is discoverable/prioritized, and MapLibre is deferred.

The preview intentionally blocks indexing through meta tags, headers and robots; sitemap.xml is empty. Lighthouse SEO is **69** because `is-crawlable` fails intentionally. Other applicable SEO audits pass. Production canonicals and the candidate sitemap remain hireyardu.com; social metadata uses the public review alias and a readable versioned 1200×630 PNG.

## Verification

| Check | Result |
| --- | --- |
| Build, syntax lint, TypeScript checkJs | Passed on final source |
| Static routes/assets/metadata/client isolation | 4,961 assertions across 26 routes |
| SEO headings, unique metadata, links, schema and frozen paths | 1,293 assertions; 66 bidirectional service/component–town pairs |
| Local HTTP/HEAD | 5,043 total assertions, including real 404, 302 preview aliases, noindex headers and blocked form actions |
| Responsive/navigation/interactions | All 25 substantive pages at six widths: 150 combinations; desktop/touch/keyboard menus, map, reviews, guide and fake-form validation passed |
| Full axe-core 4.13.0 | 66 route/state runs; zero automated violations or page errors; 1,926 incomplete observations require judgment and are not automated passes |
| Card/footer and updated content | All 18 homepage/service-hub cards at 1280/390/320: 54 geometry checks; desktop hover/focus keeps titles fixed and descriptions contained; eight updated-content axe runs passed |
| Mobile edge bars and editing | Nine touch/safe-area/keyboard states; no lead submissions |
| Review regression | 36 real/synthetic geometry states at six widths; long names, full 160-sentence fixture, expand/collapse, keyboard next/previous; zero targeted axe violations/errors |
| Logo | Five desktop/mobile placements; centered authentic SVG; one complete hero logo; 12-second clipped shine disabled for reduced motion |
| Share metadata | Three tests; readable 1200×630 PNG, factual brand/topic titles and safe HTTPS share-origin selection |
| Guide/API and rebuild behavior | 16 mocked/local HTTP tests; fixed service tags only; no personal messages/drafts sent to provider; no live provider calls |
| Visual reference comparison | design-qa.md final result passed; matching desktop/mobile source and local captures reviewed |

## Remaining review and launch decisions

The exact Google profile is https://www.google.com/maps?cid=9787269376349729307. Its 5.0/89 aggregate is a dated October 1 screenshot snapshot, separate from the existing website testimonials. Individual Google review quotes were unavailable publicly behind sign-in, so no new quotes were imported, and no Review/AggregateRating schema is added. Jackson's public founder and contact facts are in data/client-confirmed.json. Contact hours are 6 AM–10 PM; days remain unspecified and no opening-hours schema is invented.

Lead delivery and optional AI credentials are deferred by the user. The static Vercel configuration does not deploy the loopback chat API; the guide has a verified local fallback. Forms remain visibly disconnected and save/send nothing. Real iPhone Safari toolbar/keyboard and WebKit rendering remain device validation, beyond Chromium emulation.

An authorized push to the existing review branch can trigger the user's Vercel workflow. No manual production deployment, merge/main push, DNS changes, index submission, GBP edits, paid services, live forms or provider calls are part of this delivery. Before an authorized production launch, approve entity/GBP facts, migration/media redirects and lead delivery, validate live schema/paths, deliberately change indexing controls, and assess hosted/field performance. Private notes, raw evidence, Library metadata, credentials and caches are excluded from the public checkout.

## Focused mobile-bar and trust-card refinement

Both supplied screenshots were materialized and visually inspected. Mobile html/body, header/navigation, menu and bottom contact actions now have opaque #000 backgrounds; the page texture overlay is disabled on mobile. Safe-area padding remains in place, controls remain readable, and theme-color is #000000. Screenshot pixels across simulated 20px top/34px bottom safe areas are pure black. Safari's own status/address controls remain browser-owned; no native iPhone/WebKit validation is claimed.

The first two trust cards are prominent full-card links with red borders and clear action buttons. “85+ reviews” / “5.0 on Google” links to the verified Google CID with a visible October 1, 2026 snapshot note. “Get a quote” / “Start with your yard” links to /getestimate/ and says “Request a free estimate.” The existing 5.0/89 snapshot supports the conservative 85+ count; it does not establish that every individual review is five-star. No new quote or rating schema is added.

Focused verification passed build, lint/typecheck, 4,961 static assertions, 1,293 SEO assertions, 5,043 assertions including HTTP, all 150 responsive combinations, nine mobile/safe-area/keyboard states and four CTA route/keyboard/full-axe checks at 320/390/768/1440px with zero violations. Menu open/close, scrolling, editing behavior and disconnected forms remain covered. No form submission or provider call occurred.
