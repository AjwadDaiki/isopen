-- =============================================
-- IsItOpen — Schema SQL complet pour Supabase
-- Copier-coller dans Supabase > SQL Editor > New Query
-- =============================================

-- 1. BRANDS : Les grandes marques mondiales
CREATE TABLE IF NOT EXISTS brands (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        VARCHAR(100) UNIQUE NOT NULL,
  name        VARCHAR(200) NOT NULL,
  category    VARCHAR(50),
  emoji       VARCHAR(10),
  logo_url    TEXT,
  website     TEXT,
  is_24h      BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LOCATIONS : Chaque etablissement physique
CREATE TABLE IF NOT EXISTS locations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        UUID REFERENCES brands(id) ON DELETE CASCADE,
  slug            VARCHAR(100),
  address         TEXT,
  city            VARCHAR(100),
  country         VARCHAR(2),
  latitude        DECIMAL(10, 8),
  longitude       DECIMAL(11, 8),
  timezone        VARCHAR(50),
  google_place_id VARCHAR(200),
  last_verified   TIMESTAMPTZ
);

-- 3. HOURS : Horaires standards par jour
CREATE TABLE IF NOT EXISTS hours (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id     UUID REFERENCES locations(id) ON DELETE CASCADE,
  day_of_week     SMALLINT NOT NULL,
  open_time       VARCHAR(10),
  close_time      VARCHAR(10),
  is_closed       BOOLEAN DEFAULT false,
  spans_midnight  BOOLEAN DEFAULT false
);

-- 4. BRAND_HOURS : Horaires standards par marque (fallback)
CREATE TABLE IF NOT EXISTS brand_hours (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        UUID REFERENCES brands(id) ON DELETE CASCADE,
  country         VARCHAR(2),
  day_of_week     SMALLINT NOT NULL,
  open_time       VARCHAR(10),
  close_time      VARCHAR(10),
  is_closed       BOOLEAN DEFAULT false,
  spans_midnight  BOOLEAN DEFAULT false
);

-- 5. HOLIDAYS : Jours feries par pays
CREATE TABLE IF NOT EXISTS holidays (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country     VARCHAR(2) NOT NULL,
  date        DATE NOT NULL,
  name        VARCHAR(200),
  name_fr     VARCHAR(200),
  name_es     VARCHAR(200),
  affects_all BOOLEAN DEFAULT true
);

-- 6. SPECIAL_HOURS : Horaires exceptionnels
CREATE TABLE IF NOT EXISTS special_hours (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  open_time   VARCHAR(10),
  close_time  VARCHAR(10),
  is_closed   BOOLEAN DEFAULT false,
  note        TEXT
);

-- 7. USER_REPORTS : Signalements des utilisateurs
CREATE TABLE IF NOT EXISTS user_reports (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  brand_slug  VARCHAR(100),
  report_type VARCHAR(20) NOT NULL,
  message     TEXT,
  reported_at TIMESTAMPTZ DEFAULT NOW(),
  upvotes     INT DEFAULT 0
);

-- =============================================
-- INDEX pour les requetes les plus frequentes
-- =============================================
CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);
CREATE INDEX IF NOT EXISTS idx_locations_brand_city ON locations(brand_id, city, country);
CREATE INDEX IF NOT EXISTS idx_hours_location ON hours(location_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_brand_hours_brand ON brand_hours(brand_id, country, day_of_week);
CREATE INDEX IF NOT EXISTS idx_holidays_country_date ON holidays(country, date);
CREATE INDEX IF NOT EXISTS idx_user_reports_brand ON user_reports(brand_slug, reported_at DESC);

-- =============================================
-- DONNEES : 20 marques US
-- =============================================
INSERT INTO brands (slug, name, category, emoji, website, is_24h) VALUES
  ('mcdonalds', 'McDonald''s', 'Fast Food', '🍟', 'https://www.mcdonalds.com', false),
  ('walmart', 'Walmart', 'Retail', '🏪', 'https://www.walmart.com', false),
  ('starbucks', 'Starbucks', 'Coffee', '☕', 'https://www.starbucks.com', false),
  ('costco', 'Costco', 'Wholesale', '🛒', 'https://www.costco.com', false),
  ('target', 'Target', 'Retail', '🎯', 'https://www.target.com', false),
  ('burger-king', 'Burger King', 'Fast Food', '🍔', 'https://www.bk.com', false),
  ('taco-bell', 'Taco Bell', 'Fast Food', '🌮', 'https://www.tacobell.com', false),
  ('kfc', 'KFC', 'Fast Food', '🍗', 'https://www.kfc.com', false),
  ('subway', 'Subway', 'Fast Food', '🥗', 'https://www.subway.com', false),
  ('dominos', 'Domino''s', 'Pizza', '🍕', 'https://www.dominos.com', false),
  ('cvs', 'CVS Pharmacy', 'Pharmacy', '💊', 'https://www.cvs.com', false),
  ('walgreens', 'Walgreens', 'Pharmacy', '🏥', 'https://www.walgreens.com', false),
  ('home-depot', 'The Home Depot', 'Home Improvement', '🔨', 'https://www.homedepot.com', false),
  ('lowes', 'Lowe''s', 'Home Improvement', '🪛', 'https://www.lowes.com', false),
  ('chick-fil-a', 'Chick-fil-A', 'Fast Food', '🐔', 'https://www.chick-fil-a.com', false),
  ('wendys', 'Wendy''s', 'Fast Food', '🍔', 'https://www.wendys.com', false),
  ('chipotle', 'Chipotle', 'Fast Casual', '🌯', 'https://www.chipotle.com', false),
  ('post-office', 'Post Office (USPS)', 'Government', '📮', 'https://www.usps.com', false),
  ('stock-market', 'Stock Market (NYSE)', 'Financial', '📈', 'https://www.nyse.com', false),
  ('dunkin', 'Dunkin''', 'Coffee', '🍩', 'https://www.dunkindonuts.com', false)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- DONNEES : Horaires par marque (brand_hours)
-- =============================================

-- McDonald's : Lun-Jeu 06-23, Ven 06-01, Sam 07-01, Dim 07-22
INSERT INTO brand_hours (brand_id, country, day_of_week, open_time, close_time, is_closed, spans_midnight)
SELECT b.id, 'US', d.dow, d.open_t, d.close_t, d.closed, d.midnight
FROM brands b,
(VALUES
  (0, '07:00', '22:00', false, false),
  (1, '06:00', '23:00', false, false),
  (2, '06:00', '23:00', false, false),
  (3, '06:00', '23:00', false, false),
  (4, '06:00', '23:00', false, false),
  (5, '06:00', '01:00', false, true),
  (6, '07:00', '01:00', false, true)
) AS d(dow, open_t, close_t, closed, midnight)
WHERE b.slug = 'mcdonalds';

-- Walmart : tous les jours 06-23
INSERT INTO brand_hours (brand_id, country, day_of_week, open_time, close_time, is_closed, spans_midnight)
SELECT b.id, 'US', d.dow, '06:00', '23:00', false, false
FROM brands b, generate_series(0, 6) AS d(dow)
WHERE b.slug = 'walmart';

-- Starbucks : Lun-Ven 05-21, Sam 05:30-21, Dim 06-20
INSERT INTO brand_hours (brand_id, country, day_of_week, open_time, close_time, is_closed, spans_midnight)
SELECT b.id, 'US', d.dow, d.open_t, d.close_t, false, false
FROM brands b,
(VALUES
  (0, '06:00', '20:00'),
  (1, '05:00', '21:00'),
  (2, '05:00', '21:00'),
  (3, '05:00', '21:00'),
  (4, '05:00', '21:00'),
  (5, '05:00', '21:00'),
  (6, '05:30', '21:00')
) AS d(dow, open_t, close_t)
WHERE b.slug = 'starbucks';

-- Costco : Lun-Ven 10-20:30, Sam 09:30-18, Dim 10-18
INSERT INTO brand_hours (brand_id, country, day_of_week, open_time, close_time, is_closed, spans_midnight)
SELECT b.id, 'US', d.dow, d.open_t, d.close_t, false, false
FROM brands b,
(VALUES
  (0, '10:00', '18:00'),
  (1, '10:00', '20:30'),
  (2, '10:00', '20:30'),
  (3, '10:00', '20:30'),
  (4, '10:00', '20:30'),
  (5, '10:00', '20:30'),
  (6, '09:30', '18:00')
) AS d(dow, open_t, close_t)
WHERE b.slug = 'costco';

-- Target : tous les jours 08-22
INSERT INTO brand_hours (brand_id, country, day_of_week, open_time, close_time, is_closed, spans_midnight)
SELECT b.id, 'US', d.dow, '08:00', '22:00', false, false
FROM brands b, generate_series(0, 6) AS d(dow)
WHERE b.slug = 'target';

-- Chick-fil-A : Lun-Sam 06:30-22, Dim ferme
INSERT INTO brand_hours (brand_id, country, day_of_week, open_time, close_time, is_closed, spans_midnight)
SELECT b.id, 'US', d.dow, d.open_t, d.close_t, d.closed, false
FROM brands b,
(VALUES
  (0, NULL, NULL, true),
  (1, '06:30', '22:00', false),
  (2, '06:30', '22:00', false),
  (3, '06:30', '22:00', false),
  (4, '06:30', '22:00', false),
  (5, '06:30', '22:00', false),
  (6, '06:30', '22:00', false)
) AS d(dow, open_t, close_t, closed)
WHERE b.slug = 'chick-fil-a';

-- Post Office : Lun-Ven 09-17, Sam 09-13, Dim ferme
INSERT INTO brand_hours (brand_id, country, day_of_week, open_time, close_time, is_closed, spans_midnight)
SELECT b.id, 'US', d.dow, d.open_t, d.close_t, d.closed, false
FROM brands b,
(VALUES
  (0, NULL, NULL, true),
  (1, '09:00', '17:00', false),
  (2, '09:00', '17:00', false),
  (3, '09:00', '17:00', false),
  (4, '09:00', '17:00', false),
  (5, '09:00', '17:00', false),
  (6, '09:00', '13:00', false)
) AS d(dow, open_t, close_t, closed)
WHERE b.slug = 'post-office';

-- Stock Market : Lun-Ven 09:30-16, Sam-Dim ferme
INSERT INTO brand_hours (brand_id, country, day_of_week, open_time, close_time, is_closed, spans_midnight)
SELECT b.id, 'US', d.dow, d.open_t, d.close_t, d.closed, false
FROM brands b,
(VALUES
  (0, NULL, NULL, true),
  (1, '09:30', '16:00', false),
  (2, '09:30', '16:00', false),
  (3, '09:30', '16:00', false),
  (4, '09:30', '16:00', false),
  (5, '09:30', '16:00', false),
  (6, NULL, NULL, true)
) AS d(dow, open_t, close_t, closed)
WHERE b.slug = 'stock-market';

-- =============================================
-- DONNEES : Jours feries US + FR 2026
-- =============================================
INSERT INTO holidays (country, date, name, name_fr, name_es, affects_all) VALUES
  ('US', '2026-01-01', 'New Year''s Day', 'Jour de l''An', 'Año Nuevo', true),
  ('US', '2026-01-19', 'Martin Luther King Jr. Day', 'Jour de Martin Luther King Jr.', 'Día de Martin Luther King Jr.', false),
  ('US', '2026-02-16', 'Presidents'' Day', 'Jour des Présidents', 'Día de los Presidentes', false),
  ('US', '2026-04-05', 'Easter Sunday', 'Dimanche de Pâques', 'Domingo de Pascua', false),
  ('US', '2026-05-25', 'Memorial Day', 'Memorial Day', 'Día de los Caídos', false),
  ('US', '2026-07-04', 'Independence Day', 'Fête de l''Indépendance', 'Día de la Independencia', true),
  ('US', '2026-09-07', 'Labor Day', 'Fête du Travail', 'Día del Trabajo', false),
  ('US', '2026-10-12', 'Columbus Day', 'Jour de Christophe Colomb', 'Día de la Raza', false),
  ('US', '2026-11-11', 'Veterans Day', 'Jour des Anciens Combattants', 'Día de los Veteranos', false),
  ('US', '2026-11-26', 'Thanksgiving', 'Thanksgiving', 'Día de Acción de Gracias', true),
  ('US', '2026-11-27', 'Black Friday', 'Vendredi Noir', 'Viernes Negro', false),
  ('US', '2026-12-24', 'Christmas Eve', 'Réveillon de Noël', 'Nochebuena', false),
  ('US', '2026-12-25', 'Christmas Day', 'Noël', 'Navidad', true),
  ('US', '2026-12-31', 'New Year''s Eve', 'Réveillon du Nouvel An', 'Nochevieja', false),
  ('FR', '2026-01-01', 'New Year''s Day', 'Jour de l''An', 'Año Nuevo', true),
  ('FR', '2026-04-06', 'Easter Monday', 'Lundi de Pâques', 'Lunes de Pascua', true),
  ('FR', '2026-05-01', 'Labour Day', 'Fête du Travail', 'Día del Trabajo', true),
  ('FR', '2026-05-08', 'Victory Day', 'Victoire 1945', 'Día de la Victoria', true),
  ('FR', '2026-05-14', 'Ascension Day', 'Ascension', 'Día de la Ascensión', true),
  ('FR', '2026-07-14', 'Bastille Day', 'Fête Nationale', 'Día de la Bastilla', true),
  ('FR', '2026-08-15', 'Assumption of Mary', 'Assomption', 'Asunción de la Virgen', true),
  ('FR', '2026-11-01', 'All Saints'' Day', 'Toussaint', 'Día de Todos los Santos', true),
  ('FR', '2026-11-11', 'Armistice Day', 'Armistice', 'Día del Armisticio', true),
  ('FR', '2026-12-25', 'Christmas Day', 'Noël', 'Navidad', true);

-- =============================================
-- RLS (Row Level Security) — Lecture publique
-- =============================================
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read brands" ON brands;
DROP POLICY IF EXISTS "Public read brand_hours" ON brand_hours;
DROP POLICY IF EXISTS "Public read holidays" ON holidays;
DROP POLICY IF EXISTS "Public read reports" ON user_reports;
DROP POLICY IF EXISTS "Anyone can insert reports" ON user_reports;

CREATE POLICY "Public read brands" ON brands FOR SELECT USING (true);
CREATE POLICY "Public read brand_hours" ON brand_hours FOR SELECT USING (true);
CREATE POLICY "Public read holidays" ON holidays FOR SELECT USING (true);
CREATE POLICY "Public read reports" ON user_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reports" ON user_reports FOR INSERT WITH CHECK (true);

-- =============================================
-- ZERO-API-WASTE : Cache permanent + logs API
-- =============================================
CREATE TABLE IF NOT EXISTS establishments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                VARCHAR(160) UNIQUE NOT NULL,
  name                VARCHAR(255) NOT NULL,
  country             VARCHAR(2) DEFAULT 'US',
  timezone            VARCHAR(64) DEFAULT 'America/New_York',
  latitude            DECIMAL(10, 8),
  longitude           DECIMAL(11, 8),
  google_place_id     VARCHAR(255) UNIQUE,
  source              VARCHAR(24) NOT NULL DEFAULT 'manual',
  standard_hours      JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_24h              BOOLEAN NOT NULL DEFAULT false,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  last_verified_at    TIMESTAMPTZ,
  last_google_sync_at TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_establishments_slug ON establishments(slug);
CREATE INDEX IF NOT EXISTS idx_establishments_source ON establishments(source);
CREATE INDEX IF NOT EXISTS idx_establishments_verify ON establishments(last_verified_at);

CREATE TABLE IF NOT EXISTS api_logs (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider           VARCHAR(32) NOT NULL, -- google_places | local | public_dataset | nager_date
  endpoint           VARCHAR(255) NOT NULL,
  status_code        INT,
  cache_hit          BOOLEAN NOT NULL DEFAULT false,
  estimated_cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0,
  establishment_id   UUID REFERENCES establishments(id) ON DELETE SET NULL,
  notes              TEXT,
  metadata           JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_provider ON api_logs(provider, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_establishment ON api_logs(establishment_id, created_at DESC);

ALTER TABLE establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read establishments" ON establishments;
CREATE POLICY "Public read establishments" ON establishments FOR SELECT USING (true);
