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
