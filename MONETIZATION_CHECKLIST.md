# Monetization Checklist (AdSense)

## Already implemented in code

- `ads.txt` at root via `public/ads.txt` with publisher line:
  - `google.com, pub-9657496359488658, DIRECT, f08c47fec0942fa0`
- AdSense loader script in global `<head>` (all pages):
  - `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=...`
- `<meta name="google-adsense-account" content="ca-pub-9657496359488658" />` in root layout.
- Middleware excludes `ads.txt` so crawler access is direct.
- `robots.txt` generation configured via `next-sitemap` and allows:
  - `*`
  - `AdsBot-Google`
  - `Mediapartners-Google`
- Reusable ad blocks added and ready:
  - Home pages (top + mid)
  - Brand pages (inline)
  - Day pages (inline)

## Vercel env vars to set

- `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-9657496359488658`
- `NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP=<your-slot-id>`
- `NEXT_PUBLIC_ADSENSE_SLOT_HOME_MID=<your-slot-id>`
- `NEXT_PUBLIC_ADSENSE_SLOT_BRAND_INLINE=<your-slot-id>`

If slot variables are empty, the UI shows reserved ad placeholders (no ad request).

## Validation steps after deploy

1. Deploy production on Vercel.
2. Open and verify:
   - `https://isopenow.com/ads.txt`
   - `https://isopenow.com/robots.txt`
   - `https://isopenow.com/sitemap.xml`
3. In AdSense site verification, retry validation.
4. Wait for crawler refresh (can take from a few minutes up to 24-48 hours).

## Common failure causes

- Wrong domain added in AdSense (must match exactly: `isopenow.com`).
- `ads.txt` not yet propagated on CDN.
- Publisher ID mismatch between script/meta and `ads.txt`.
- Site still under review / policy review pending in AdSense.
