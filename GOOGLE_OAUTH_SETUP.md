# 🔐 Google OAuth 登录配置指南

## 📋 配置步骤

### 1. Google Cloud Console 项目设置

#### 创建或选择项目
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 点击顶部的项目选择器
3. 选择现有项目或点击 **"新建项目"**
4. 项目名称建议：`ShareX AI` 或 `article-generator`

#### 启用必要的 API
1. 在左侧菜单中选择 **"API 和服务"** > **"库"**
2. 搜索并启用以下 API：
   - **Google+ API** (用户基本信息)
   - **People API** (用户详细信息)

### 2. OAuth 同意屏幕配置

#### 基本信息设置
1. 选择 **"API 和服务"** > **"OAuth 同意屏幕"**
2. 用户类型选择：**"外部"** (External)
3. 填写应用信息：

```
应用名称：ShareX AI
用户支持邮箱：your-support-email@domain.com
应用徽标：上传您的应用 logo (可选)
应用主页：https://your-app.vercel.app
应用隐私政策链接：https://your-app.vercel.app/privacy
应用服务条款链接：https://your-app.vercel.app/terms
已获授权的域名：your-app.vercel.app
开发者联系信息：your-dev-email@domain.com
```

#### 作用域 (Scopes) 配置
添加以下必要的作用域：
- `../auth/userinfo.email` - 获取用户邮箱
- `../auth/userinfo.profile` - 获取用户基本信息
- `openid` - OpenID 连接

### 3. OAuth 2.0 客户端 ID 创建

#### 创建凭据
1. 选择 **"API 和服务"** > **"凭据"**
2. 点击 **"创建凭据"** > **"OAuth 2.0 客户端 ID"**
3. 应用类型：**"网页应用"**

#### 配置授权来源和重定向
```
授权的 JavaScript 来源：
- http://localhost:3000 (开发环境)
- https://your-app.vercel.app (生产环境)

授权的重定向 URI：
- http://localhost:3000/api/auth/callback/google (开发环境)
- https://your-app.vercel.app/api/auth/callback/google (生产环境)
```

⚠️ **重要**：重定向 URI 必须精确匹配，包括路径和协议！

### 4. 获取客户端凭据

创建完成后，您将获得：
- **客户端 ID**: `123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com`
- **客户端密钥**: `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx`

## ⚙️ 环境变量配置

### 本地开发 (.env.local)
```bash
# NextAuth.js 配置
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-32-char-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx

# 其他必需变量
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Vercel 生产环境
在 Vercel 项目设置中添加：
```bash
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-random-32-char-secret-key
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
```

## 🔧 代码配置验证

项目中的 NextAuth 配置已经设置好了，检查以下文件：

### src/lib/auth.ts
```typescript
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  // ... 其他配置
}
```

## 🧪 测试登录功能

### 本地测试
1. 设置好环境变量
2. 运行 `npm run dev`
3. 访问 `http://localhost:3000`
4. 点击 Google 登录按钮

### 生产环境测试
1. 部署到 Vercel
2. 在 Vercel 中设置环境变量
3. 访问您的 Vercel 应用
4. 测试 Google 登录

## ⚠️ 常见问题解决

### 错误 1：redirect_uri_mismatch
**原因**：重定向 URI 不匹配
**解决**：检查 Google Cloud Console 中的重定向 URI 是否与实际 URL 完全匹配

### 错误 2：invalid_client
**原因**：客户端 ID 或密钥错误
**解决**：检查环境变量是否正确复制

### 错误 3：access_denied
**原因**：应用未通过验证或作用域错误
**解决**：检查 OAuth 同意屏幕配置和作用域设置

### 错误 4：NEXTAUTH_SECRET missing
**原因**：NextAuth 密钥未设置
**解决**：生成一个 32 位随机字符串作为 NEXTAUTH_SECRET

## 🔐 生成 NEXTAUTH_SECRET

使用以下方法之一生成安全的密钥：

### 方法 1: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 方法 2: OpenSSL
```bash
openssl rand -base64 32
```

### 方法 3: 在线工具
访问：https://generate-secret.vercel.app/32

## 📱 移动端兼容性

如果需要支持移动端 OAuth：
1. 在 Google Cloud Console 中添加移动应用类型
2. 配置 Android/iOS 应用详细信息
3. 添加相应的 URL schemes

## 🛡️ 安全最佳实践

1. **定期轮换客户端密钥**
2. **监控 OAuth 使用情况**
3. **限制授权域名**
4. **使用 HTTPS**
5. **验证 state 参数**

## 📊 用户数据处理

登录成功后，用户信息会被存储到 Supabase 数据库中：
- 用户基本信息（姓名、邮箱、头像）
- 创建时间和最后登录时间
- 用户角色（默认为 'user'）

---

✅ **配置完成后，用户就可以通过 Google 账号一键登录您的 ShareX AI 平台了！**

如有问题，请参考本文档的常见问题部分或联系技术支持。