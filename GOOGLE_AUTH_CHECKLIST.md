# ✅ Google OAuth 快速配置清单

## 🚀 5分钟快速设置

### 第一步：Google Cloud Console
1. [ ] 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. [ ] 创建新项目或选择现有项目
3. [ ] 启用 **Google+ API** 和 **People API**

### 第二步：OAuth 同意屏幕
1. [ ] 选择 "OAuth 同意屏幕" → "外部"
2. [ ] 填写基本信息：
   ```
   应用名称：ShareX AI
   用户支持邮箱：your-email@domain.com
   应用主页：https://your-app.vercel.app
   隐私政策：https://your-app.vercel.app/privacy
   服务条款：https://your-app.vercel.app/terms
   ```

### 第三步：创建 OAuth 2.0 凭据
1. [ ] "凭据" → "创建凭据" → "OAuth 2.0 客户端 ID"
2. [ ] 应用类型：**网页应用**
3. [ ] 授权的重定向 URI：
   ```
   开发: http://localhost:3000/api/auth/callback/google
   生产: https://your-app.vercel.app/api/auth/callback/google
   ```

### 第四步：设置环境变量

#### 本地开发 (.env.local)
```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=生成的32位随机字符串
GOOGLE_CLIENT_ID=你的客户端ID
GOOGLE_CLIENT_SECRET=你的客户端密钥
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Vercel 生产环境
在 Vercel 项目设置中添加相同的环境变量，但 URL 改为您的域名

### 第五步：测试
1. [ ] 本地运行 `npm run dev`
2. [ ] 访问首页，点击 Google 登录
3. [ ] 成功登录后应该看到用户信息

## 🔑 快速生成 NEXTAUTH_SECRET

```bash
# 方法 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# 方法 2: 在线工具
# 访问: https://generate-secret.vercel.app/32
```

## 🚨 常见错误

### ❌ redirect_uri_mismatch
**解决**: 检查重定向 URI 是否完全匹配

### ❌ invalid_client  
**解决**: 检查 GOOGLE_CLIENT_ID 和 GOOGLE_CLIENT_SECRET

### ❌ NEXTAUTH_SECRET missing
**解决**: 生成并设置 32 位随机字符串

## 📱 部署后更新

部署到 Vercel 后，记得：
1. [ ] 在 Google Cloud Console 中添加生产环境重定向 URI
2. [ ] 在 Vercel 中设置所有环境变量
3. [ ] 测试生产环境登录

---

✅ **完成这些步骤后，Google 登录就可以正常工作了！**

💡 **提示**: 如果您只想快速测试，可以先设置最小配置（NEXTAUTH_SECRET + GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET），其他功能可以后续添加。