-- Stripe 支付系统和会员订阅数据库表结构
-- 在 Supabase SQL 编辑器中运行此脚本

-- 1. 套餐计划表
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_usd DECIMAL(10,2) NOT NULL,
  duration_months INTEGER NOT NULL,
  daily_article_limit INTEGER, -- NULL 表示无限制
  stripe_price_id TEXT UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 插入默认套餐
INSERT INTO subscription_plans (name, description, price_usd, duration_months, daily_article_limit) VALUES
('免费版', '每天最多转发3篇文章', 0.00, 1, 3),
('VIP月付', 'VIP会员月付，无限制转发', 9.00, 1, NULL),
('VIP年付', 'VIP会员年付，无限制转发', 90.00, 12, NULL);

-- 2. 用户订阅表
CREATE TABLE user_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_profiles(user_id),
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active', -- active, expired, cancelled
  started_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  stripe_subscription_id TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. 用户每日使用量统计表
CREATE TABLE user_daily_usage (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_profiles(user_id),
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  articles_created INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, usage_date)
);

-- 4. 订单表
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES user_profiles(user_id),
  plan_id INTEGER NOT NULL REFERENCES subscription_plans(id),
  amount_usd DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, cancelled, refunded
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_session_id TEXT UNIQUE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. 支付记录表
CREATE TABLE payment_records (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  user_id TEXT NOT NULL REFERENCES user_profiles(user_id),
  amount_usd DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  payment_method TEXT, -- card, bank_transfer, etc.
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL, -- succeeded, failed, cancelled, refunded
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. 系统配置表（用于后台管理设置）
CREATE TABLE system_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 插入默认配置
INSERT INTO system_settings (key, value, description) VALUES
('stripe_config', '{"publishable_key": "", "webhook_secret": ""}', 'Stripe 配置信息'),
('plan_prices', '{"monthly": 9.00, "yearly": 90.00}', '套餐价格配置'),
('free_daily_limit', '3', '免费版每日文章限制');

-- 创建索引
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_expires_at ON user_subscriptions(expires_at);
CREATE INDEX idx_user_daily_usage_user_date ON user_daily_usage(user_id, usage_date);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_payment_records_user_id ON payment_records(user_id);
CREATE INDEX idx_payment_records_status ON payment_records(status);

-- 更新用户配置表，添加管理员角色
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'; -- user, admin
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS daily_article_count INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_article_date DATE;

-- 创建函数：检查用户是否为VIP
CREATE OR REPLACE FUNCTION is_user_vip(user_id_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  vip_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO vip_count
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_id_param 
    AND us.status = 'active'
    AND us.expires_at > NOW()
    AND sp.daily_article_limit IS NULL;
    
  RETURN vip_count > 0;
END;
$$ LANGUAGE plpgsql;

-- 创建函数：检查用户今日是否可以创建文章
CREATE OR REPLACE FUNCTION can_user_create_article(user_id_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_vip BOOLEAN;
  today_usage INTEGER;
  daily_limit INTEGER;
BEGIN
  -- 检查是否是VIP
  SELECT is_user_vip(user_id_param) INTO is_vip;
  
  IF is_vip THEN
    RETURN TRUE;
  END IF;
  
  -- 获取今日使用量
  SELECT COALESCE(articles_created, 0) INTO today_usage
  FROM user_daily_usage
  WHERE user_id = user_id_param AND usage_date = CURRENT_DATE;
  
  -- 获取免费版限制
  SELECT COALESCE(value::INTEGER, 3) INTO daily_limit
  FROM system_settings
  WHERE key = 'free_daily_limit';
  
  RETURN today_usage < daily_limit;
END;
$$ LANGUAGE plpgsql;

-- 创建函数：增加用户今日文章使用量
CREATE OR REPLACE FUNCTION increment_user_daily_usage(user_id_param TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_daily_usage (user_id, usage_date, articles_created)
  VALUES (user_id_param, CURRENT_DATE, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET 
    articles_created = user_daily_usage.articles_created + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;