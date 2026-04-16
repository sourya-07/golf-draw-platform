-- ============================================================
-- Digital Heroes Golf Club — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Charities (created before users since users FK references it) ──
CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  events JSONB DEFAULT '[]',
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Users (extends Supabase auth.users) ───────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  subscription_status TEXT DEFAULT 'inactive'
    CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'lapsed')),
  subscription_plan TEXT CHECK (subscription_plan IN ('monthly', 'yearly')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  charity_id UUID REFERENCES charities(id) ON DELETE SET NULL,
  charity_percentage INTEGER DEFAULT 10 CHECK (charity_percentage >= 10),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Golf Scores ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS golf_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, score_date)
);

-- ── Draws ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_month DATE NOT NULL,
  draw_type TEXT NOT NULL CHECK (draw_type IN ('random', 'algorithmic')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'simulated', 'published')),
  winning_numbers INTEGER[],
  jackpot_amount DECIMAL(10,2),
  jackpot_rolled_over BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- ── Draw Entries ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS draw_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  submitted_numbers INTEGER[],
  match_count INTEGER DEFAULT 0,
  prize_tier TEXT DEFAULT 'none' CHECK (prize_tier IN ('5_match', '4_match', '3_match', 'none')),
  prize_amount DECIMAL(10,2) DEFAULT 0
);

-- ── Prize Pool ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prize_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
  total_pool DECIMAL(10,2),
  jackpot_pool DECIMAL(10,2),
  four_match_pool DECIMAL(10,2),
  three_match_pool DECIMAL(10,2),
  rolled_over_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Winner Verifications ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS winner_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_entry_id UUID REFERENCES draw_entries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  proof_image_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payout_status TEXT DEFAULT 'pending' CHECK (payout_status IN ('pending', 'paid')),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Indexes ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_golf_scores_user_id ON golf_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_golf_scores_score_date ON golf_scores(score_date);
CREATE INDEX IF NOT EXISTS idx_draw_entries_draw_id ON draw_entries(draw_id);
CREATE INDEX IF NOT EXISTS idx_draw_entries_user_id ON draw_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_winner_verifications_user_id ON winner_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);

-- ── Row Level Security ────────────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE winner_verifications ENABLE ROW LEVEL SECURITY;

-- Users: can read/update their own row; service role can insert (registration)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (true);

-- Golf scores: users manage their own
CREATE POLICY "Users manage own scores" ON golf_scores FOR ALL USING (auth.uid() = user_id);

-- Charities: public read
CREATE POLICY "Charities are public" ON charities FOR SELECT USING (true);

-- Draws: published draws are public
CREATE POLICY "Published draws are public" ON draws FOR SELECT USING (status = 'published');

-- Draw entries: users see their own
CREATE POLICY "Users see own draw entries" ON draw_entries FOR SELECT USING (auth.uid() = user_id);

-- Prize pool: public read
CREATE POLICY "Prize pool is public" ON prize_pool FOR SELECT USING (true);

-- Winner verifications: users see their own
CREATE POLICY "Users see own verifications" ON winner_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own verifications" ON winner_verifications FOR UPDATE USING (auth.uid() = user_id);

-- ── Seed Data — Sample Charities ──────────────────────────────────
INSERT INTO charities (name, description, image_url, is_featured, is_active)
VALUES
  (
    'Cancer Research UK',
    'Funding world-class research to defeat cancer. Every pound raised supports scientists working to find new treatments and cures.',
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600',
    true, true
  ),
  (
    'Macmillan Cancer Support',
    'Providing medical, emotional, practical and financial support to people living with cancer.',
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600',
    true, true
  ),
  (
    'Children in Need',
    'Helping disadvantaged children and young people across the UK live safer, happier and more secure lives.',
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600',
    false, true
  ),
  (
    'Age UK',
    'The country''s leading charity working with and for older people, providing support and inspiring millions.',
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600',
    false, true
  ),
  (
    'British Heart Foundation',
    'Fighting heart and circulatory disease, funding pioneering research, information and vital support.',
    'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600',
    true, true
  );
