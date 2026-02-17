# Audit Fonctionnel Complet - IsItOpen

Date d'audit: 2026-02-17

Ce document liste ce qui est en place dans le projet, avec statut precis pour verification.

## 1) Routing, pages et generation

- `OK` Home page: `src/app/page.tsx`
  - Hero + grille de marques par categorie
  - Statut open/closed sur chaque card
  - Liens SEO vers `/is-{slug}-open`
- `OK` Brand page: `src/app/brand/[slug]/page.tsx`
  - Reponse principale OPEN/CLOSED
  - Horaires semaine, bloc jours specifiques, FAQ, related, reports
  - Ad slots places dans la page
- `OK` Day pages: `src/app/brand/[slug]/[day]/page.tsx`
  - Pages pour `sunday..saturday + christmas + thanksgiving + new-years + easter`
- `OK` Category pages: `src/app/category/[slug]/page.tsx`
  - 10 categories mappees (fast-food, retail, coffee, etc.)
- `OK` Search page: `src/app/search/page.tsx`
  - Recherche client-side (nom, slug, categorie)
- `OK` Pages legales:
  - About: `src/app/about/page.tsx`
  - Privacy: `src/app/privacy/page.tsx`
  - Terms: `src/app/terms/page.tsx`
- `OK` Not found page: `src/app/not-found.tsx`
- `OK` i18n route layer:
  - `src/app/[locale]/layout.tsx` (locales non-EN)
  - `src/app/[locale]/brand/[slug]/page.tsx`

## 2) Rewrites SEO-friendly

- `OK` Rewrites actives dans `next.config.ts`:
  - `/is-:slug-open -> /brand/:slug`
  - `/is-:slug-open-on-{day} -> /brand/:slug/{day}`
  - `/:locale(fr|es)/is-:slug-open -> /:locale/brand/:slug`

## 3) Donnees et modele horaire

- `OK` Dataset marques statiques: `src/data/brands.ts`
  - 20 marques configurees
  - Categories, emoji, website, is24h
  - Horaires hebdo + cas spanning-midnight
- `OK` Holidays data: `src/data/holidays.ts`
- `OK` Helper data access:
  - `getBrandBySlug`, `getRelatedBrands`, `getAllBrandSlugs`

## 4) Logique "is open now"

- `OK` Core algo: `src/lib/isOpenNow.ts`
  - Timezone via `date-fns-tz`
  - Cas 24h
  - Cas ferme aujourd'hui
  - Cas overnight/spansMidnight
  - "closes in", "opens at", "local time"
  - Prochain opening day calcule

## 5) Components UX

- `OK` Navbar: `src/components/Navbar.tsx`
  - Horloge live
  - Search autocomplete
  - Navigation unifiee vers `/is-{slug}-open`
  - Bouton search mobile
- `OK` Status hero: `src/components/StatusHero.tsx`
  - Polling `/api/open-status` toutes les 30s
  - CTA: site officiel, report issue, share/copy link
- `OK` Hours table: `src/components/HoursTable.tsx`
- `OK` Holiday alert: `src/components/HolidayAlert.tsx`
- `OK` User reports UI: `src/components/UserReports.tsx`
  - Lecture + envoi report
  - Ancre `#user-reports`
- `OK` Related brands: `src/components/RelatedBrands.tsx`
- `OK` Trending sidebar: `src/components/TrendingSidebar.tsx`
- `OK` Affiliate block: `src/components/AffiliateUnit.tsx`
- `OK` Footer: `src/components/Footer.tsx`

## 6) API routes

- `OK` Open status API: `src/app/api/open-status/route.ts`
  - Query params: `brand`, `timezone`
  - Return brand + status
  - Cache-Control SWR
- `OK` Report submit API: `src/app/api/report/route.ts`
  - Validation `brandSlug`, `reportType`
  - Insert Supabase `user_reports`
- `OK` Reports list API: `src/app/api/reports/route.ts`
  - Query params: `brand`, `limit`
  - Retourne derniers reports tri desc

## 7) Supabase et variables env

- `OK` Client Supabase: `src/lib/supabase.ts`
- `OK` Variables actuellement utilisees par le code:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- `INFO` Variable Google Places recommandee pour Vercel:
  - `GOOGLE_PLACES_API_KEY`
- `INFO` Aucune integration Google Places active dans le code actuel (pas de consommation de la cle a ce stade).

## 8) SEO technique

- `OK` Metadata globales: `src/app/layout.tsx`
- `OK` Metadata dynamiques brand/day/category pages
- `OK` Canonical URLs configurees
- `OK` JSON-LD:
  - LocalBusiness via `src/lib/schema.ts`
  - FAQPage via `src/lib/schema.ts`
- `OK` Sitemap config: `next-sitemap.config.js`
- `OK` Robots present: `public/robots.txt`

## 9) Analytics et tracking

- `OK` Google Tag Manager installe dans `src/app/layout.tsx`
  - Container: `GTM-P7FP826D`
  - Script + `noscript iframe`
- `PARTIEL` Google Analytics direct (gtag/GA4) non code en dur.
  - Si GA4 est declenche via GTM, c'est bon.
  - Sinon, il faut ajouter une balise GA4 dans GTM.

## 10) Publicite / monetisation

- `OK` Emplacements pubs prepares dans `src/components/AdSlot.tsx`
  - Formats: `728x90`, `300x250`, `300x600`
  - Injectes sur page brand (inline + sidebar)
- `PARTIEL` Ce sont des placeholders visuels pour l'instant.
  - A brancher sur vrai provider (AdSense/Ezoic/etc.) pour diffusion reelle.
- `PARTIEL` Affiliate unit est UI-only (pas de tracking link reel configure).

## 11) Build et qualite

- `OK` Lint passe (`eslint`)
- `OK` Build prod passe (`next build`)
- `OK` Revalidate ISR 300s sur pages principales

## 12) Points a verifier manuellement (checklist rapide)

- [ ] Home affiche categories + statuts: `/`
- [ ] Une page marque repond clairement OPEN/CLOSED: `/is-walmart-open`
- [ ] Day page marche: `/is-walmart-open-on-sunday`
- [ ] Category page marche: `/category/retail`
- [ ] Search fonctionne: `/search`
- [ ] Reports:
  - [ ] ouverture form
  - [ ] envoi report
  - [ ] affichage du report
- [ ] CTA "Official website" ouvre le site brand
- [ ] CTA "Share" copie/partage bien l'URL
- [ ] GTM present dans source HTML
- [ ] Ad slots visibles aux positions attendues

## 13) Etat global

- Core produit (verification ouverture + pages SEO): `EN PLACE`
- UX principale (navigation + pages + statuts + reports): `EN PLACE`
- SEO technique de base (metadata, schema, sitemap): `EN PLACE`
- Tracking (GTM): `EN PLACE`
- Monetisation reelle (ads/affiliate live): `A FINALISER`
- Donnees temps reel externes (Google Places): `A INTEGRER`

## 14) Zero-API-Waste (nouveau)

- `OK` Strategie cache-first active:
  - `/api/open-status` lit d'abord Supabase via `getStatusFromCacheBySlug`.
  - Si present en table `establishments`, statut servi sans appel Google.
- `OK` Fonction `get_status` implementee:
  - Fichier: `src/lib/establishments.ts`
  - Alias explicite `get_status` + logique cache/permanent storage.
- `OK` Tables d'optimisation cout ajoutees:
  - `establishments` (cache permanent par etablissement)
  - `api_logs` (tracking de chaque appel sortant et cout estime)
  - Definies dans `supabase-schema.sql`.
- `OK` Cron hebdo en place:
  - Endpoint: `GET /api/cron/weekly-verify`
  - Verifie les etablissements non verifies depuis >7 jours.
- `OK` Dashboard admin conso:
  - Page: `/admin?token=...`
  - API: `/api/admin/consumption`
  - KPIs: calls, cout estime, cache ratio, Supabase vs Google.
- `OK` Doc architecture dediee:
  - `ARCHITECTURE_ZERO_API_WASTE.md`
