# Google登录和用户名系统设置说明

## 🔧 环境变量配置

请在 `.env.local` 文件中添加以下环境变量：

```bash
# Google OAuth 配置
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth 配置
NEXTAUTH_SECRET=your_random_secret_key
NEXTAUTH_URL=http://localhost:3000

# Supabase 配置（已有的）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe 支付配置
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# 应用基础URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 📊 数据库表结构

需要在 Supabase 中创建以下表：

**注意：除了之前的表，还需要运行以下SQL文件创建支付相关表：**
- `database_functions.sql` - 创建浏览量统计函数
- `database_subscription_schema.sql` - 创建订阅和支付相关表

### 1. user_profiles 表

```sql
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
```

### 2. 更新现有的 articles 表

```sql
-- 添加用户相关字段到现有的 articles 表
ALTER TABLE articles 
ADD COLUMN user_id TEXT,
ADD COLUMN username TEXT;

-- 创建索引
CREATE INDEX idx_articles_user_id ON articles(user_id);
CREATE INDEX idx_articles_username ON articles(username);
CREATE INDEX idx_articles_username_slug ON articles(username, slug);
```

### 3. NextAuth 所需表（由适配器自动创建）

NextAuth Supabase适配器会自动创建以下表：
- `accounts`
- `sessions` 
- `users`
- `verification_tokens`

## 🔑 Google OAuth 设置

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 凭据
5. 添加授权重定向 URI：
   - 开发环境: `http://localhost:3000/api/auth/callback/google`
   - 生产环境: `https://your-domain.com/api/auth/callback/google`

## 💳 Stripe 支付设置

1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 创建账户或登录现有账户
3. 获取 API 密钥：
   - 可发布密钥 (Publishable key): `pk_test_...`
   - 密钥 (Secret key): `sk_test_...`
4. 设置 Webhook 端点：
   - URL: `https://your-domain.com/api/webhooks/stripe`
   - 监听事件: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
   - 获取 Webhook 签名密钥: `whsec_...`

## 👑 管理员权限设置

1. 在 Supabase 中找到你的用户记录
2. 将 `role` 字段设置为 `admin`
3. 访问 `/admin` 路径进入管理后台

## ✨ 功能特性

### 用户认证
- ✅ Google OAuth 登录
- ✅ 用户 session 管理
- ✅ 自动用户配置创建

### 用户名系统
- ✅ 自定义英文用户名（3-30字符）
- ✅ 实时可用性检查
- ✅ 用户名唯一性验证
- ✅ 个人资料编辑

### 会员订阅系统
- ✅ 免费版（每日3篇文章）
- ✅ VIP月付（$9/月，无限制）
- ✅ VIP年付（$90/年，无限制）
- ✅ Stripe 支付集成
- ✅ 自动会员升级

### URL结构
- ✅ 个人主页: `/{username}`
- ✅ 用户文章: `/{username}/{slug}`
- ✅ 向下兼容: `/{slug}`（无用户名的文章）
- ✅ 订阅页面: `/subscription/pricing`

### 用户体验
- ✅ 登录状态显示
- ✅ 个人主页展示
- ✅ 文章列表管理
- ✅ 用户信息展示
- ✅ 会员状态显示
- ✅ 升级提示

### 营销功能
- ✅ 品牌营销信息展示
- ✅ 文章浏览量统计
- ✅ 右侧边栏布局
- ✅ 用户主页营销横幅

### 管理后台
- ✅ 管理员仪表板
- ✅ 用户管理（列表/搜索/查看）
- ✅ 文章管理（列表/搜索/查看）
- ✅ 订单管理
- ✅ 数据统计功能

## 🚀 使用流程

1. 用户通过 Google 登录
2. 系统自动创建用户配置
3. 用户可设置自定义用户名
4. 发布的文章使用 `/{username}/{slug}` URL
5. 访问个人主页查看所有文章

## 📝 注意事项

- 用户名只能包含英文字母、数字和下划线
- 用户名长度为3-30个字符
- 用户名全局唯一
- 设置用户名后，文章URL自动使用新结构
- 未设置用户名的文章仍使用旧的 `/{slug}` 结构