# SEO Growth Playbook (2026)

## Product Direction
- Own the intent: "is [brand] open right now"
- Expand from brand-level pages to location-level pages over time
- Keep pages fast, accurate, and trustable for both Search and AdSense

## What Was Improved In This Pass
- Fixed sitemap canonicalization for rewritten routes
- Removed malformed hreflang entries from sitemap output
- Added technical metadata hardening in root layout
- Added `noindex,follow` on internal search page
- Added a public contact page and linked it from footer
- Upgraded About/Privacy/Terms page quality and metadata
- Fixed 404 page quality and design consistency
- Normalized internal day-check links to canonical URL builders
- Expanded localized category coverage to all detected categories

## Priority Backlog

### P0: Content and Entity Depth
- Add editorial intros for every brand page (150-300 words, unique)
- Add per-category comparison pages (best times, common holiday behavior)
- Add location templates for top metros (city + brand)

### P1: Topical Authority
- Publish help-center guides:
  - holiday hours methodology
  - timezone handling and edge cases
  - data correction policy
- Add changelog entries for major hours updates

### P2: Structured Data Expansion
- Add `WebPage` schema on core templates with `inLanguage`, `dateModified`
- Add `ItemList` schema for category listings
- Add `Organization.sameAs` social/profile links when available

### P3: Crawl and Indexation
- Keep `search` results noindexed
- Monitor indexed canonical vs non-canonical URLs in Search Console
- Monitor soft-404 and duplicate-title reports monthly

### P4: Performance and UX
- Optimize LCP on brand pages (hero + sidebar loading order)
- Keep CLS near zero around ad slots using fixed placeholders
- Add synthetic uptime checks for API status endpoint

## AdSense Readiness Checklist
- Privacy policy published and linked
- Terms of service published and linked
- Contact page published and linked
- About page published and linked
- `ads.txt` present
- `robots.txt` allows `AdsBot-Google` and `Mediapartners-Google`
- Clear editorial content beyond ad-only blocks

## Metrics To Track Weekly
- Indexed pages (Search Console)
- Non-branded clicks and impressions
- Top landing pages by CTR
- Canonical mismatch warnings
- Core Web Vitals by template
- RPM and policy warnings in AdSense
