# October 18 approved guide release

Authorized by Rajat on October 18, 2026: publish both approved articles and Guides hub, then test production. Base production source: 575cefc14ea05d41681525af2d32ac88dd343450, branch codex/yardu-website.

Routes: /guides/, /guides/lawn-care-costs-raleigh/, /guides/choosing-mowing-service-raleigh/. Includes Guides navigation, reciprocal lawn-maintenance/guide links, Organization-authored BlogPosting and hub ItemList, breadcrumb/canonical metadata, responsive styles and truthful first-publication dates of October 18.

Local validation: lint and type checks; preview build plus 6,382 site checks and 1,989 SEO assertions; 32 unit/integration tests; production build and 35-URL sitemap/robots/internal-link/hosting checks; git diff --check. Preview-only noindex assertions are run against the preview build, production assertions against the production build. Independent guide review found no release blocker.

Existing CRM estimate destination, contact details, service routes, latest seasonal design and project proof are preserved. No client notification, form submission, paid research or indexing submission is part of this release. Production/provider and browser readback must be recorded separately after deployment.

Rollback: revert this guide release through the existing production branch, retaining unrelated newer changes. Pre-release production SHA is recorded above.
