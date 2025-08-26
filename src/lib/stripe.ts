import Stripe from 'stripe';

// 服务端 Stripe 实例
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil',
});

// 客户端 Stripe 配置
export const stripePromise = import('@stripe/stripe-js').then(({ loadStripe }) =>
  loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')
);

// 套餐类型定义
export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price_usd: number;
  duration_months: number;
  daily_article_limit: number | null;
  stripe_price_id: string | null;
  is_active: boolean;
}

// 用户订阅状态
export interface UserSubscription {
  id: number;
  user_id: string;
  plan_id: number;
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  expires_at: string;
  stripe_subscription_id: string | null;
}

// 订单状态
export interface Order {
  id: number;
  user_id: string;
  plan_id: number;
  amount_usd: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// 创建 Stripe 结账会话
export async function createCheckoutSession(
  planId: number,
  userId: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'SharetoX VIP 订阅',
          },
          unit_amount: 0, // 将在服务端获取实际价格
        },
        quantity: 1,
      },
    ],
    metadata: {
      user_id: userId,
      plan_id: planId.toString(),
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

// 验证 Stripe webhook 签名
export function verifyStripeSignature(payload: string, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}