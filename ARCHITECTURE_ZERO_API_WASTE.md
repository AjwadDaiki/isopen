# Architecture Zero-API-Waste

## Goal

Reduce paid API usage (Google Places) to near zero with:
- single-fetch bootstrap per establishment,
- permanent storage in Supabase,
- local open/closed computation on every user visit,
- weekly verification cron only.

## Core Strategy

1. `Single-Fetch` bootstrap:
   - Google Places can be called once to initialize an establishment.
   - Persisted in `establishments` (name, timezone, place id, standard hours, source).
   - After bootstrap, user traffic must read cache only.

2. Local status computation:
   - `computeOpenStatus` runs from stored hours.
   - Never depends on Google `open_now` for live rendering.

3. Weekly verification:
   - Route: `GET /api/cron/weekly-verify`
   - Runs once a week (Vercel cron).
   - Updates `last_verified_at` and logs API impact in `api_logs`.

4. Free data first:
   - Institutions: manual/public datasets (`source=public` / `manual`).
   - Holidays: Nager.Date (free) or internal table.
   - Major chains: manual/scrape defaults to avoid Google entirely.
   - Google is optional, only for unresolved local businesses.

## Data Model

Tables:
- `establishments`
- `api_logs`

Defined in `supabase-schema.sql`.

## Main Functions

- `get_status(establishment_id, timezone, options)` in `src/lib/establishments.ts`
  - cache-first
  - optional bootstrap
  - logs usage to `api_logs`

- `getStatusFromCacheBySlug(slug, timezone)`
  - used by `/api/open-status`
  - serves local status from Supabase when available

- `runWeeklyVerification()`
  - used by cron route
  - keeps data fresh without per-visit API costs

## Admin Monitoring

Dashboard:
- Page: `/admin?token=...`
- API: `/api/admin/consumption`

Metrics:
- calls per day/month
- estimated cost
- cache hit ratio
- Supabase-served vs Google-served ratio (target: >=95% Supabase)

## Env Variables

- `GOOGLE_PLACES_API_KEY` (optional)
- `ADMIN_DASHBOARD_TOKEN` (recommended)
- `CRON_SECRET` (recommended)

## Vercel Cron (recommended)

Schedule:
- weekly (example every Monday 03:00 UTC)

Call:
- `GET https://isopenow.com/api/cron/weekly-verify`
- Header: `Authorization: Bearer ${CRON_SECRET}`
