# IsItOpen — Timeline de developpement

## Etape 1 : Setup initial (FAIT)
- Projet Next.js 16 + TypeScript + Tailwind CSS initialise
- Fonts : Bricolage Grotesque (display) + JetBrains Mono (data)
- Deploiement local fonctionnel

## Etape 2 : Architecture backend (FAIT)
- Schema Prisma complet : 7 tables (brands, locations, hours, brand_hours, holidays, special_hours, user_reports)
- Index SQL sur les requetes les plus frequentes
- Singleton Prisma client pour eviter les fuites de connexion

## Etape 3 : Logique metier isOpenNow (FAIT)
- Fonction `computeOpenStatus()` avec gestion complete :
  - Fuseaux horaires (date-fns-tz)
  - Horaires qui passent minuit (spans_midnight)
  - Jours feries et horaires speciaux
  - Calcul du temps restant avant fermeture/ouverture
- Types TypeScript complets pour tout le domaine

## Etape 4 : Pages & composants UI (FAIT)
- Homepage avec grille par categorie, statut en temps reel
- Page brand `/is-[slug]-open` complete :
  - StatusHero : carte OPEN/CLOSED avec countdown, heure locale, actions
  - HoursTable : tableau des horaires avec barres visuelles
  - HolidayAlert : alerte jours feries proches
  - AffiliateUnit : bloc affilies contextuels (Uber Eats pour food, Amazon pour retail)
  - UserReports : signalements utilisateurs avec formulaire
  - RelatedBrands : marques similaires avec statut live
  - TrendingSidebar : top 5 marques
  - Liens internes vers pages temporelles (Monday, Christmas, etc.)
- Navbar : recherche, horloge live, detection timezone
- Page 404 custom
- Design fidele au mockup : palette warm paper (#f7f4ee), vert/rouge binaire

## Etape 5 : SEO & pages multiples (FAIT)
- **296 pages statiques pre-generees** en SSG
- Schema JSON-LD (LocalBusiness + OpeningHoursSpecification) sur chaque page
- Meta tags dynamiques (title, description, canonical, hreflang)
- next-sitemap configure avec generation automatique
- ISR (revalidate: 300s)
- Types de pages :
  - 20 pages brand EN (`/is-mcdonalds-open`)
  - 40 pages brand FR+ES (`/fr/is-mcdonalds-open`, `/es/is-mcdonalds-open`)
  - 220 pages temporelles (`/is-mcdonalds-open-on-sunday`, `on-christmas`, etc.)
  - 10 pages categories (`/category/fast-food`, etc.)
  - 2 API routes (`/api/open-status`, `/api/report`)

## Etape 6 : i18n FR + ES (FAIT)
- Systeme de traduction complet (3 langues : EN, FR, ES)
- Toutes les chaines UI traduites
- Pages localisees avec hreflang tags
- URL rewrites pour les 3 langues

## Etape 7 : Donnees (FAIT)
- 20 marques US avec horaires complets
- Jours feries US + FR 2026 (14 US + 11 FR)
- HolidayAlert automatique quand un jour ferie approche (< 14 jours)

## Etape 8 : API (FAIT)
- `GET /api/open-status?brand=mcdonalds&timezone=America/New_York`
- `POST /api/report` (signalements utilisateurs)
- Cache headers pour performance CDN

## Etape 9 : Supabase connecte (FAIT)
- Base de donnees Supabase configuree et SQL execute
- 7 tables creees avec RLS (Row Level Security)
- 20 marques + horaires + 25 jours feries inseres
- Client Supabase (public + service role) dans `src/lib/supabase.ts`
- Couche de donnees Supabase (`src/lib/supabase-data.ts`) : fetchAllBrands, fetchBrandWithHours, fetchReports, fetchUpcomingHolidays
- `POST /api/report` ecrit dans Supabase avec degradation gracieuse
- `GET /api/reports?brand=mcdonalds` lit les signalements depuis Supabase
- `.env.local` avec les 3 cles (URL, anon key, service role key)

## Etape 10 : Pages legales + Search + Production (FAIT)
- **301 pages statiques** (build OK)
- Pages legales : `/privacy`, `/terms`, `/about`
- Page recherche `/search` avec filtre instantane
- Composant Footer reutilisable avec liens legaux
- `robots.txt` dans `/public`
- Sitemap configure avec priorites par type de page
- OpenGraph + Twitter Card meta tags
- `metadataBase` configure pour les URLs absolues

---

## Prochaines etapes
- [ ] Deployer sur Vercel
- [ ] Configurer Google Search Console + GA4
- [ ] Demander Google AdSense
- [ ] Ajouter version DE et PT (allemand + portugais)
- [ ] Script Google Places API pour enrichir la BDD automatiquement
- [ ] Initialiser le repo Git + push sur GitHub
