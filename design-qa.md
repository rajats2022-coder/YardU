# YardU design QA — October 1, 2026

**Final result: passed.** No known fixable P0/P1/P2 findings remain in the reviewed scope.

## Reference and comparison

The selected reference is https://zsexteriors.com, including its homepage, mulch detail page and Bristow service-area page. Public reference and local YardU pages were captured in the existing isolated Playwright Chromium browser on the user's Mac at matching 1440×1000 desktop and 390×844 mobile viewports. Side-by-side hero comparisons and full-page captures were reviewed. Additional responsive checks cover 320, 390, 768, 960, 1280 and 1440px widths.

The adapted design preserves the reference's utility/navigation header, truck-led desktop hero, mobile photo above centered black copy, stacked mobile CTAs, four trust tiles, angled crew introduction, services grid and quote strip, photo/numbered process accordion, benefits split, reviews, conversion band, project gallery, service-area section, FAQs and dark footer. Service and city templates follow the same photo/content rhythm while retaining YardU's existing detailed content and navigation.

Poppins is self-hosted. Red, black and white replace the reference palette. Responsive images use authentic YardU photos; the truck hero is the client's actual YardU truck. The complete YardU logo is preserved with a centered presentation viewBox. No reference company photography, review quotes, offers, licensing, financing or location claims are imported.

## Corrections verified

- Mobile homepage and inner-page photos precede centered copy and stacked CTAs; truck framing, heading wrapping, drawer bounds, safe areas and editing/keyboard placement were checked.
- Photo/copy pairs in the process, benefits and conversion sections fit their desktop columns. Picture source elements no longer occupy unwanted grid tracks.
- Service cards fit their grid tracks and viewport. Titles and accent lines keep fixed positions during hover/focus; descriptions remain inside the footer. All 18 homepage/service-hub cards were checked at 1280/390/320px, including mouse and keyboard behavior at desktop.
- DJ Burns' existing website testimonial is first, with its existing YardU-site photo and official NC State basketball profile link. A face crop excludes the baked-in play icon. Author, quote and action geometry remains separated at six widths, including long-name and expanded long-quote fixtures.
- Jackson's sole-founder profile and official 2023/2022 NC State football links are present. Unknown people in the crew photo are not identified as Jackson.
- Logo placements and the clipped 12-second shine were checked; reduced-motion disables it. The share image contains one complete logo/tagline.
- Navigation, the working map, review controls, FAQs and disconnected form validation remain usable.

## Intentional differences and limits

Client-specific text is factual YardU copy, so heading length and content height differ from the reference. Trust tiles describe verified purpose/package/communities/contact instead of unsupported source claims. YardU's working service hub, six distinct city pages, breadcrumbs, map and local estimate guide are preserved. Forms remain visibly disconnected. A dated Google 5.0/89 snapshot remains separate from website testimonials.

Automated axe checks reported zero violations across 66 route/state runs; incomplete image/gradient observations received visual review and are not certification. Chromium touch/safe-area/keyboard emulation does not certify native iOS Safari toolbar/keyboard or WebKit behavior. A real iPhone check remains a device validation step. Performance measurements are local lab results, not production/field measurements.
