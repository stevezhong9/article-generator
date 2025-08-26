# 🚀 ShareX AI - Vercel 部署指南

## 📋 部署前准备

### 1. 环境变量配置

在 Vercel 项目设置中添加以下环境变量：

#### 必需的环境变量：
```bash
# NextAuth.js 配置
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secure-random-string-32-chars-long

# 应用基础URL
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app

# Supabase 数据库
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google OAuth (可选，用于用户登录)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe 支付 (可选，用于VIP功能)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
```

#### 可选环境变量：
```bash
# 联系信息
ADMIN_EMAIL=admin@yourdomain.com
LEGAL_EMAIL=legal@yourdomain.com
DMCA_EMAIL=dmca@yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com

# SMTP 邮件服务 (可选)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-email-password
```

### 2. 数据库设置 (Supabase)

在 Supabase 中执行以下 SQL 文件来创建必要的表：

1. `database_subscription_schema.sql` - 用户订阅系统
2. `database_functions.sql` - 数据库函数
3. `database_contact_schema.sql` - 联系表单
4. `database_copyright_schema.sql` - 版权合规系统

## 🚀 部署步骤

### 方法 1: 通过 Vercel CLI

1. 安装 Vercel CLI：
```bash
npm install -g vercel
```

2. 在项目根目录运行：
```bash
vercel login
vercel --prod
```

3. 按照提示配置项目

### 方法 2: 通过 GitHub + Vercel (推荐)

1. 将代码推送到 GitHub 仓库：
```bash
git add .
git commit -m "🚀 Ready for Vercel deployment with brand styling and copyright compliance"
git push origin main
```

2. 在 [Vercel Dashboard](https://vercel.com/dashboard) 中：
   - 点击 "New Project"
   - 选择 GitHub 仓库
   - 配置环境变量
   - 点击 "Deploy"

### 方法 3: 通过拖拽部署

1. 打包项目：
```bash
npm run build
```

2. 压缩项目文件（除了 node_modules 和 .next）

3. 在 Vercel 网站直接拖拽上传

## ⚙️ 部署配置

### Vercel 项目设置

在 Vercel 项目设置中确保：

- **Framework Preset**: Next.js
- **Node.js Version**: 18.x 或 20.x
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 域名配置

1. 在 Vercel 项目中添加自定义域名
2. 更新环境变量中的 URL
3. 配置 DNS 记录

## 🔧 部署后配置

### 1. Stripe Webhook 配置 (如果使用支付功能)

在 Stripe Dashboard 中添加 webhook：
- URL: `https://your-domain.vercel.app/api/webhooks/stripe`
- 事件: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.deleted`

### 2. Google OAuth 配置 (如果使用登录功能)

在 Google Console 中添加：
- 授权重定向 URI: `https://your-domain.vercel.app/api/auth/callback/google`

### 3. Supabase Auth 配置

在 Supabase 项目设置中添加：
- Site URL: `https://your-domain.vercel.app`
- Redirect URLs: `https://your-domain.vercel.app/api/auth/callback/google`

## 📊 功能验证清单

部署完成后，请验证以下功能：

### ✅ 基本功能
- [ ] 网站正常访问
- [ ] 品牌样式正确显示
- [ ] 多语言切换工作
- [ ] 响应式设计正常

### ✅ 核心功能 
- [ ] 文章抓取和生成
- [ ] 长图生成功能
- [ ] 社交媒体分享
- [ ] 用户个人页面

### ✅ 高级功能
- [ ] 用户登录注册
- [ ] VIP 订阅系统
- [ ] 管理员后台
- [ ] 版权合规功能

### ✅ 合规功能
- [ ] 隐私政策页面 (/privacy)
- [ ] 服务条款页面 (/terms)  
- [ ] DMCA 政策页面 (/dmca)
- [ ] Cookie 政策页面 (/cookies)
- [ ] 联系我们页面 (/contact)

## 🐛 常见问题解决

### 构建失败
- 检查所有必需的环境变量是否设置
- 确保 Supabase 数据库表已创建
- 检查 package.json 中的依赖版本

### 数据库连接错误
- 验证 Supabase URL 和密钥
- 检查 Supabase 项目是否已暂停
- 确认数据库表和 RLS 策略正确设置

### 认证问题
- 检查 NEXTAUTH_SECRET 是否设置
- 验证 Google OAuth 重定向 URL
- 确认 Supabase Auth 配置正确

## 📈 性能优化建议

1. **启用 Vercel Analytics**
2. **配置 CDN 缓存策略**
3. **使用 Vercel Image Optimization**
4. **启用 Speed Insights**

## 🔒 安全建议

1. **定期轮换 API 密钥**
2. **启用 Vercel Firewall**
3. **监控异常访问模式**
4. **定期更新依赖包**

---

🎉 **恭喜！** 您的 ShareX AI 平台现在已经部署完成，具备完整的品牌设计和版权合规功能！

访问您的网站查看效果，如遇问题请参考常见问题解决部分。