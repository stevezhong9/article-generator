-- View count increment functions for Supabase
-- Run these in your Supabase SQL editor

-- 1. Function to increment view count by article ID
CREATE OR REPLACE FUNCTION increment_view_count(article_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE articles 
  SET view_count = COALESCE(view_count, 0) + 1,
      updated_at = NOW()
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- 2. Function to increment view count by slug (for old format articles)
CREATE OR REPLACE FUNCTION increment_view_count_by_slug(article_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE articles 
  SET view_count = COALESCE(view_count, 0) + 1,
      updated_at = NOW()
  WHERE slug = article_slug;
END;
$$ LANGUAGE plpgsql;

-- 3. Function to increment view count by username and slug
CREATE OR REPLACE FUNCTION increment_view_count_by_username_slug(article_username TEXT, article_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE articles 
  SET view_count = COALESCE(view_count, 0) + 1,
      updated_at = NOW()
  WHERE username = article_username AND slug = article_slug;
END;
$$ LANGUAGE plpgsql;

-- 4. Ensure articles table has view_count column (if not already added)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- 5. Add marketing_data column to user_profiles if not exists
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS marketing_data JSONB;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_view_count ON articles(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_marketing_data ON user_profiles USING GIN(marketing_data);