# YardU homepage cover and Facebook consistency

Prepared from production branch a6e0baa; original cover and Facebook changes approved and pushed as fc18a7d.

- User supplied IMG_5653.HEIC: branded YardU truck in a residential driveway.
- Added 960px and 1920px WebP derivatives; original unchanged.
- Replaced only the homepage hero photo, preserving other truck images.
- Checked desktop 1440x1000 and mobile 390x844 visually; mobile overflow false.
- Added approved Facebook URL to shared footer and Organization sameAs:
  https://www.facebook.com/p/YardU-61574836663307/
- Added image dimensions to asset manifest, including missing existing Storeboard badge dimensions.
- Passed build, 6345 site checks, 1952 SEO assertions, lint, production configuration checks, and git diff --check.

Directory readback this session:
- Brownbook: Facebook added and verified on public listing.
- MerchantCircle, ProvenExpert, EZlocal: already have approved Facebook URL.
- Hotfrog, Storeboard, Houzz: no YardU Facebook link visible on inspected public profile; authenticated editor checks remain.
- Alignable: Edit Profile requires emailed six-digit verification; user asked to complete it.

User approved publishing both changes, then approved compositing only AI grass patches onto the original. A lossless pixel check verifies original pixels outside the two small lawn masks remain unchanged. Final responsive derivatives use the grass-only composite; the complete AI redraw is not used. Live verification is recorded separately after deployment.
