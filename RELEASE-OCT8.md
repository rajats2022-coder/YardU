# October 8 production release

Adds the five client-confirmed services and six-town SEO coverage while preserving the current public pages, assets, and CRM embed. The current live main content of 25 pages was compared with the generated candidate; differences are the intended additions, service links, Cary wording, and daily-hours correction. Live Homeworks CSS was recovered. Original offloaded source remains untouched; unseen unpublished changes are not claimed recovered.

Production builds now allow crawling, emit 30 canonical sitemap entries, and use public-domain share URLs. Preview builds retain noindex and blocking robots. Existing aliases and 13 hash-verified original image paths receive permanent redirects. Broken footer links to absent legacy policy/franchise/video pages were removed; no replacement business/legal content was invented.

Validation: build, lint, declared TypeScript 7 compiler, 6,887 generated-site checks, 1,724 SEO assertions, service/chat/share tests, production-mode sitemap/meta/robots/link/header checks; 60 rendered desktop/mobile states with zero overflow, page exceptions, or axe violations. Browser QA excluded external frames and made no submissions.

Remaining verification: Vercel production deployment readback, public-route/header checks, live CRM frame load, external schema validation, Search Console sitemap submission and page inspection. Google indexing and ranking are provider outcomes, not build guarantees. Search Console currently requires the owner's Google sign-in.

## Verified public release and Google submission

PRs #1 and #2 merged into the production branch; Vercel reported successful deployment. Fresh public checks passed for all 30 substantive URLs, index/follow metadata, production canonicals/share URLs, JSON-LD parsing, 30 sitemap entries, crawlable robots.txt, all 21 alias/media redirects and a true 404 for unknown URLs. Live CRM iframe fields loaded; no test lead was submitted.

Schema.org external tests for Christmas Light Installs, Apex city guide and Mowing component reported zero errors and warnings. Public mobile Lighthouse: Performance 98, SEO 100, Accessibility 100, Best Practices 100. An additional experimental visible-label/accessibility mismatch on the Google review summary was fixed by using its visible text as its accessible name.

Google Search Console ownership for https://hireyardu.com/ was verified by the Google-issued HTML file under rajat@s4aiagency.com. The refreshed sitemap.xml submission returned “Sitemap submitted successfully.” The Christmas lights page returned “URL is unknown to Google,” then an accepted “Indexing requested” priority-crawl receipt. Those receipts do not establish indexing. Existing aggregate report counts predate this release.

Google's live Rich Results Test crawled the Christmas lights page successfully and detected three valid items (breadcrumbs, organization and business entity). Its two optional recommendations were business image and address. Added the verified client truck photo as the organization image. Physical address remains omitted for the service-area business rather than inventing or exposing an unverified address. Apex's page also received an accepted indexing request; both inspected pages were unknown to Google's index before those requests.
