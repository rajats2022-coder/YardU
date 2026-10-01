# YardU Google review snapshot

`google-profile.json` contains YardU’s verified public profile identity (CID 9787269376349729307), matching site and phone. The user’s October 1 Google screenshot verifies aggregate 5.0/89; local public readback confirms name/site/phone and the exact profile. The homepage hero, review cards and review section link to this profile. The displayed aggregate is a dated static snapshot, not live synchronization.

Google’s public local-browser view asks for sign-in to read reviews and has no review tab. No sign-in, account setup, CAPTCHA bypass or review interaction was attempted. No new individual Google quote is published. The existing two cards are explicitly website testimonials, with generic profile links rather than misleading “read this review” links. New Google review excerpts need a verified export or accessible public review source with author, date, rating and review/profile URL.

No `google-reviews.json` exists. The separate loader remains ready for verified individual reviews; none is fabricated.

To use the snapshot-based mechanism, obtain a client-authorized YardU GBP export or verified public review snapshot and YardU’s exact read/write review URLs. Add `data/google-reviews.json` only after verifying identity, current aggregate values, review attribution, observation date, and publishing permission. No API keys are needed for rendering a supplied snapshot. Refreshing it is a separate provider integration task.

Required fields:

| Field | Requirement |
| --- | --- |
| `status` | `verified` |
| `source` | `google-business-profile` |
| `businessName` | `YardU` |
| `businessUrl` | `https://hireyardu.com` |
| `observedAt` | Actual `YYYY-MM-DD` observation date |
| `rating` | Verified numeric aggregate, 0–5 |
| `reviewCount` | Verified integer aggregate, at least the supplied review count |
| `googleReviewsUrl` | YardU’s verified HTTPS Google review destination |
| `googleWriteReviewUrl` | YardU’s verified HTTPS Google write-review destination |
| `reviews` | Nonempty array with actual `name`, `text`, and integer `rating` 1–5 |

The loader rejects a different business identity, unverified source state, malformed review data, or non-Google destinations. It escapes all supplied text. It never borrows another client’s place ID, ratings, names, text, credentials, or refresh script. No fake review fixture is shipped.
