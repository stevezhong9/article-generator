# 🔥 Stripe 快速配置清单

## ⚡ 5分钟快速设置

### 第一步：获取 Stripe 密钥
1. [ ] 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. [ ] 进入 "开发者" → "API 密钥"
3. [ ] 复制以下密钥：
   ```bash
   STRIPE_SECRET_KEY=sk_test_51xxxxxxxxx...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxx...
   ```

### 第二步：创建产品和价格
1. [ ] 在 Stripe Dashboard 创建产品："ShareX AI VIP 订阅"
2. [ ] 为同一产品创建两个价格：
   - 月度：$9.00 USD (记录 price_id)
   - 年度：$90.00 USD (记录 price_id)

### 第三步：设置 Webhook
1. [ ] 创建 Webhook 端点：`https://your-app.vercel.app/api/webhooks/stripe`
2. [ ] 选择事件：
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
3. [ ] 复制 Webhook 签名密钥：`whsec_xxxxxxxxx...`

### 第四步：配置环境变量

#### Vercel 生产环境
```bash
STRIPE_SECRET_KEY=sk_live_51xxxxxxxxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51xxxxxxxxx...
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx...
STRIPE_PRICE_MONTHLY=price_xxxxxxxxx...
STRIPE_PRICE_YEARLY=price_yyyyyyyyy...
```

#### 本地开发 (.env.local)
```bash
STRIPE_SECRET_KEY=sk_test_51xxxxxxxxx...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxxxxxx...
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx...
STRIPE_PRICE_MONTHLY=price_xxxxxxxxx...
STRIPE_PRICE_YEARLY=price_yyyyyyyyy...
```

### 第五步：测试支付
1. [ ] 使用测试卡号：4242 4242 4242 4242
2. [ ] 访问：`/subscription/pricing`
3. [ ] 完成测试支付流程

## 🧪 测试卡号

```bash
# 支付成功
4242 4242 4242 4242

# 支付失败  
4000 0000 0000 0002

# 需要3D验证
4000 0025 0000 3155
```

## 🚨 注意事项

- ⚠️ 测试环境使用 `sk_test_` 和 `pk_test_` 开头的密钥
- ⚠️ 生产环境使用 `sk_live_` 和 `pk_live_` 开头的密钥
- ⚠️ Webhook URL 必须是 HTTPS
- ⚠️ 价格 ID 必须与 Stripe Dashboard 中完全一致

## ✅ 验证清单

- [ ] Stripe Dashboard 账户创建完成
- [ ] API 密钥获取并配置
- [ ] 产品和价格创建完成
- [ ] Webhook 端点配置完成
- [ ] 环境变量设置完成
- [ ] 测试支付流程通过

---

✅ **完成后，您的 VIP 订阅支付系统就可以正常运行了！**

💡 **提示**: 所有支付相关代码已集成完毕，您只需要配置 Stripe Dashboard 和环境变量即可。