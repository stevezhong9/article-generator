# 🎯 Stripe Dashboard 信息查找指南

## 🔑 API 密钥获取位置

### 路径：Dashboard → 开发者 → API 密钥
```
https://dashboard.stripe.com/apikeys
```

**在此页面找到：**
- 📍 **可发布密钥** (Publishable key)
  - 位置：页面上方，标有 "pk_test_" 或 "pk_live_"
  - 点击眼睛图标显示完整密钥
  - 复制到：`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

- 📍 **密钥** (Secret key)
  - 位置：页面下方，标有 "sk_test_" 或 "sk_live_"
  - 点击眼睛图标显示完整密钥
  - 复制到：`STRIPE_SECRET_KEY`

## 💰 价格 ID 获取位置

### 路径：Dashboard → 产品目录
```
https://dashboard.stripe.com/products
```

**操作步骤：**
1. 点击 "添加产品" 按钮
2. 填写产品信息：
   ```
   产品名称：ShareX AI VIP 订阅
   ```
3. 添加两个价格方案：

**月度方案：**
- 价格：$9.00 USD
- 计费：每月重复
- 保存后在产品页面可看到价格 ID
- 📍 复制 `price_xxxxx` 到：`STRIPE_PRICE_MONTHLY`

**年度方案：**
- 价格：$90.00 USD  
- 计费：每年重复
- 保存后在产品页面可看到价格 ID
- 📍 复制 `price_yyyyy` 到：`STRIPE_PRICE_YEARLY`

## 🔗 Webhook 密钥获取位置

### 路径：Dashboard → 开发者 → Webhooks
```
https://dashboard.stripe.com/webhooks
```

**操作步骤：**
1. 点击 "添加端点" 按钮
2. 填写端点信息：
   ```
   端点 URL: https://your-app.vercel.app/api/webhooks/stripe
   ```
3. 选择监听的事件：
   - ✅ checkout.session.completed
   - ✅ payment_intent.succeeded
   - ✅ payment_intent.payment_failed

4. 创建后点击该 Webhook 端点
5. 在 "签名密钥" 部分：
   - 📍 点击 "点击显示" 链接
   - 复制 `whsec_xxxxx` 到：`STRIPE_WEBHOOK_SECRET`

## 🔄 测试 vs 生产环境

### 切换环境
在 Stripe Dashboard 右上角有一个开关：
- 🧪 **测试数据** (Test Data) - 使用测试密钥
- 🌟 **实时数据** (Live Data) - 使用生产密钥

### 密钥前缀区别
```bash
# 测试环境
STRIPE_SECRET_KEY=sk_test_51[YOUR_TEST_KEY]...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51[YOUR_TEST_KEY]...

# 生产环境  
STRIPE_SECRET_KEY=sk_live_51[YOUR_LIVE_KEY]...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51[YOUR_LIVE_KEY]...
```

## ⚡ 快速配置检查清单

- [ ] 在 https://dashboard.stripe.com/apikeys 获取 API 密钥
- [ ] 在 https://dashboard.stripe.com/products 创建产品和价格
- [ ] 在 https://dashboard.stripe.com/webhooks 设置 Webhook
- [ ] 复制所有密钥到 Vercel 环境变量
- [ ] 使用测试卡号 4242424242424242 进行测试

## 🎯 最终配置示例

```bash
# 从 dashboard.stripe.com/apikeys 获取
STRIPE_SECRET_KEY=sk_live_51H[YOUR_ACTUAL_SECRET_KEY]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51H[YOUR_ACTUAL_PUBLISHABLE_KEY]

# 从产品页面获取两个价格的 ID
STRIPE_PRICE_MONTHLY=price_1H[YOUR_MONTHLY_PRICE_ID]
STRIPE_PRICE_YEARLY=price_1H[YOUR_YEARLY_PRICE_ID]

# 从 Webhook 设置页面获取
STRIPE_WEBHOOK_SECRET=whsec_[YOUR_WEBHOOK_SECRET]
```

---

📍 **所有信息都在 Stripe Dashboard 中，按照上述路径即可找到！**