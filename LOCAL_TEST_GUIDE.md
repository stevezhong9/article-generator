# 本地测试指南

## 🧪 快速开始本地测试

### 1. 启动开发服务器
```bash
npm run dev
```

### 2. 访问本地测试页面
打开浏览器访问：**http://localhost:3000/test**

这个页面完全模拟了用户登录后的状态，展示完整的一键转发表单功能。

## ✅ 本地测试功能

### 🚀 一键转发表单
- **左侧区域（2/3宽度）**：完整的转发表单
  - 文章URL输入框（必填）
  - 营销推广信息（可选）：Logo、品牌名称、电话、邮箱
  - 一键转发按钮

- **右侧区域（1/3宽度）**：书签工具
  - 可拖拽的书签按钮
  - 使用说明

### 🎯 测试流程
1. 在URL输入框中输入任意网址（如：https://example.com/article）
2. （可选）填写营销推广信息
3. 点击"开始转发"按钮
4. 查看模拟的处理结果
5. 测试复制链接、查看文章等功能

### 📱 响应式测试
- 桌面端：左右分栏布局
- 移动端：垂直堆叠布局
- 测试不同屏幕尺寸的显示效果

## 🔧 本地测试环境配置

### 环境变量
`.env.local` 文件已配置为本地测试模式：

```env
# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=local_development_secret_key_for_testing_only_not_secure

# Google OAuth Configuration (本地测试用模拟值)
GOOGLE_CLIENT_ID=local_test_client_id
GOOGLE_CLIENT_SECRET=local_test_client_secret

# Stripe Configuration (本地测试用模拟值)  
STRIPE_PUBLISHABLE_KEY=pk_test_local_development_key
STRIPE_SECRET_KEY=sk_test_local_development_key
STRIPE_WEBHOOK_SECRET=whsec_local_development_webhook_secret

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL="https://dzquuwdtzkjvhshauuiu.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
```

### 测试API端点
- **GET /api/test-scrape**：查看测试API信息
- **POST /api/test-scrape**：模拟文章抓取功能

## 🚨 注意事项

### 仅用于本地开发测试
- 所有数据均为模拟生成
- 不会进行真实的网络请求
- 不会保存到数据库
- 环境变量使用测试值

### 生产环境配置
生产环境需要配置真实的环境变量：
- Google OAuth应用密钥
- Supabase数据库连接
- Stripe支付密钥
- NextAuth密钥等

## 📋 测试清单

### ✅ 界面测试
- [ ] 一键转发表单正确显示
- [ ] 响应式布局在不同设备正常
- [ ] 书签工具可以拖拽
- [ ] 表单验证工作正常

### ✅ 功能测试  
- [ ] URL输入和验证
- [ ] 营销信息表单
- [ ] 提交按钮和加载状态
- [ ] 错误处理显示
- [ ] 结果页面展示

### ✅ 交互测试
- [ ] 表单提交流程
- [ ] 重置功能
- [ ] 复制链接功能
- [ ] 按钮悬停效果

## 🎨 设计验证

### 布局结构
- ✅ 左侧转发表单（lg:col-span-2）
- ✅ 右侧书签工具（lg:col-span-1）
- ✅ 转发文章区域突出显示（蓝色渐变边框）
- ✅ 营销推广区域次要显示（灰色边框）

### 色彩主题
- ✅ 主色调：蓝色系（#2D9CDB）
- ✅ 辅助色：橙色系（#FF7B54）
- ✅ 渐变背景和按钮效果
- ✅ 统一的圆角和阴影

## 🐛 常见问题

### Q: 为什么首页不显示一键转发表单？
A: 首页表单只对已登录用户显示。请访问 `/test` 页面查看模拟登录状态的完整表单。

### Q: 如何测试真实的Google登录？
A: 需要在Vercel或生产环境配置真实的Google OAuth密钥，本地测试使用模拟数据。

### Q: 提交表单后没有反应？
A: 检查浏览器开发者工具的Network和Console标签，确认API请求正常。

### Q: 样式显示异常？
A: 确保CSS文件正确加载，检查Tailwind CSS配置。

---

## 📞 技术支持

如果在本地测试过程中遇到问题，请检查：
1. 开发服务器是否正常启动
2. 浏览器控制台是否有错误信息
3. 网络请求是否正常发送和接收

本地测试环境完全模拟了生产环境的用户体验，确保功能开发和测试的一致性。