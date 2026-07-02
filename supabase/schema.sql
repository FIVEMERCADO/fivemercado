-- =========================================
-- FiveM Marketplace - Supabase Schema
-- Run this in Supabase SQL Editor
-- =========================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  avatar TEXT,
  email TEXT,
  credits INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'user', -- 'user' | 'admin' | 'seller'
  bio TEXT DEFAULT '',
  reputation_score NUMERIC(3,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

INSERT INTO categories (name, slug) VALUES
  ('Standalone', 'standalone'),
  ('QBCORE/QBOX', 'qbcore-qbox'),
  ('ESX', 'esx'),
  ('Server Dumps', 'server-dumps'),
  ('Other', 'other')
ON CONFLICT (slug) DO NOTHING;

-- Scripts table
CREATE TABLE IF NOT EXISTS scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id),
  price INTEGER NOT NULL DEFAULT 0, -- stored in credits
  is_free BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  images TEXT[] DEFAULT '{}',
  file_option TEXT DEFAULT 'direct', -- 'direct' | 'links'
  files TEXT[] DEFAULT '{}',
  external_links TEXT[] DEFAULT '{}',
  views INTEGER NOT NULL DEFAULT 0,
  downloads INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  price_paid INTEGER NOT NULL DEFAULT 0,
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, script_id)
);

-- Redeem codes table (Discord bot download codes)
CREATE TABLE IF NOT EXISTS redeem_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redeem_codes_code ON redeem_codes(code);
CREATE INDEX IF NOT EXISTS idx_redeem_codes_user ON redeem_codes(user_id);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'PURCHASE' | 'SCRIPT_SALE' | 'PAYPAL_TOPUP'
  amount INTEGER NOT NULL, -- positive = earned, negative = spent
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, script_id)
);

-- =========================================
-- Row Level Security (RLS) policies
-- =========================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE redeem_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (server-side with SUPABASE_SERVICE_KEY bypasses RLS)
-- Public can read approved scripts
CREATE POLICY "Public read approved scripts" ON scripts
  FOR SELECT USING (status = 'approved');

-- Users can read their own data
CREATE POLICY "Users read own data" ON users
  FOR SELECT USING (true); -- public profiles

CREATE POLICY "Users read own purchases" ON purchases
  FOR SELECT USING (true);

CREATE POLICY "Public read reviews" ON reviews
  FOR SELECT USING (true);

-- =========================================
-- Function to update script rating on review insert/update
-- =========================================
CREATE OR REPLACE FUNCTION update_script_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE scripts SET
    rating = (SELECT AVG(rating)::NUMERIC(3,1) FROM reviews WHERE script_id = NEW.script_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE script_id = NEW.script_id)
  WHERE id = NEW.script_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rating
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_script_rating();

-- =========================================
-- PayPal — pending_orders + add_credits RPC
-- =========================================

CREATE TABLE IF NOT EXISTS pending_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 hour'
);

CREATE INDEX IF NOT EXISTS idx_pending_orders_order_id ON pending_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_pending_orders_user_id  ON pending_orders(user_id);

-- Limpia órdenes expiradas (ejecutar via cron o manualmente)
-- DELETE FROM pending_orders WHERE expires_at < NOW();

-- =========================================
-- Reacciones de scripts (👍 ❤️ 🔥 😢 😡)
-- =========================================

CREATE TABLE IF NOT EXISTS script_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, script_id)
);

CREATE INDEX IF NOT EXISTS idx_script_reactions_script ON script_reactions(script_id);

-- =========================================
-- Scripts guardados / Wishlist
-- =========================================

CREATE TABLE IF NOT EXISTS saved_scripts (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, script_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_scripts_user ON saved_scripts(user_id);

-- =========================================
-- Download nonces — single-use, anti-replay
-- =========================================

-- Columna last_seen en users (heartbeat)
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);

CREATE TABLE IF NOT EXISTS download_nonces (
  nonce TEXT PRIMARY KEY,
  script_id UUID NOT NULL REFERENCES scripts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '5 minutes',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_download_nonces_expires ON download_nonces(expires_at);
-- Limpieza periódica (cron o manualmente):
-- DELETE FROM download_nonces WHERE expires_at < NOW();

CREATE OR REPLACE FUNCTION add_credits(p_user_id UUID, p_credits INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE users SET credits = credits + p_credits WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- CARS — Marketplace de carros con handling
-- =========================================

CREATE TABLE IF NOT EXISTS cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Sport',
  -- 'Sport' | 'Muscle' | 'SUV' | 'Sedan' | 'Supercar' | 'Offroad' | 'Van' | 'Moto'
  description TEXT DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  image_url TEXT,
  -- Ruta en Cloudflare R2: ej. "cars/ferrari-488/base.zip"
  r2_path TEXT,
  -- Nombre del handling (handlingName en el .meta, ej. "FERRARI488")
  handling_name TEXT NOT NULL,
  -- Handling base en JSON — valores que el usuario puede editar
  handling JSONB NOT NULL DEFAULT '{
    "fMass": 1500,
    "fInitialDragCoeff": 10.0,
    "fMaxVelocity": 250.0,
    "fBrakeForce": 0.7,
    "fBrakeBiasFront": 0.38,
    "fHandBrakeForce": 0.6,
    "fSteeringLock": 40.0,
    "fTractionCurveMax": 2.4,
    "fTractionCurveMin": 1.8,
    "fTractionBiasFront": 0.47,
    "fDriveInertia": 1.0,
    "nInitialDriveGears": 6,
    "fInitialDriveForce": 0.32,
    "fInitialDriveMaxFlatVel": 160.0,
    "fSuspensionForce": 2.0,
    "fSuspensionCompDamp": 1.5,
    "fSuspensionReboundDamp": 2.0,
    "fSuspensionUpperLimit": 0.10,
    "fSuspensionLowerLimit": -0.10,
    "fSuspensionRaise": 0.0,
    "fSuspensionBiasFront": 0.5,
    "fAntiRollBarForce": 0.4,
    "fAntiRollBarBiasFront": 0.5,
    "fCollisionDamageMult": 1.0,
    "fWeaponDamageMult": 1.0,
    "fDeformationDamageMult": 0.6,
    "fEngineDamageMult": 1.5,
    "fPetrolTankVolume": 65.0
  }',
  -- Stats visuales para la card (0-100)
  stats JSONB NOT NULL DEFAULT '{"speed":50,"acceleration":50,"braking":50,"handling":50}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cars_category    ON cars(category);
CREATE INDEX IF NOT EXISTS idx_cars_published   ON cars(is_published);
CREATE INDEX IF NOT EXISTS idx_cars_price       ON cars(price);

-- Compras de carros
CREATE TABLE IF NOT EXISTS car_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  price_paid INTEGER NOT NULL DEFAULT 0,
  -- Handling guardado por el usuario (null = usa el base)
  custom_handling JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, car_id)
);

CREATE INDEX IF NOT EXISTS idx_car_purchases_user ON car_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_car_purchases_car  ON car_purchases(car_id);

-- Nonces para descargas de carros (mismo sistema que scripts)
CREATE TABLE IF NOT EXISTS car_download_nonces (
  nonce TEXT PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  custom_handling JSONB,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '10 minutes',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
