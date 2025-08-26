import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { ArticleSupabase, supabase } from '@/lib/supabase';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      console.error('Missing Stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('收到Stripe Webhook事件:', event.type);

    // 处理不同的事件类型
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
        
      default:
        console.log(`未处理的事件类型: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook处理错误:', error);
    return NextResponse.json(
      { error: 'Webhook处理失败' },
      { status: 500 }
    );
  }
}

// 处理结账会话完成
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log('处理结账会话完成:', session.id);
    
    const { user_id, plan_id, order_id } = session.metadata || {};
    
    if (!user_id || !plan_id || !order_id) {
      console.error('Checkout session metadata不完整:', session.metadata);
      return;
    }

    // 更新订单状态
    await ArticleSupabase.updateOrderStatus(parseInt(order_id), 'paid', {
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent
    });

    // 创建支付记录
    if (supabase) {
      await supabase
        .from('payment_records')
        .insert([{
          order_id: parseInt(order_id),
          user_id,
          amount_usd: (session.amount_total || 0) / 100, // 转换回美元
          currency: session.currency || 'usd',
          payment_method: 'card',
          stripe_payment_intent_id: session.payment_intent as string,
          status: 'succeeded'
        }]);
    }

    // 获取套餐信息并创建用户订阅
    const plans = await ArticleSupabase.getSubscriptionPlans();
    const plan = plans.find(p => p.id === parseInt(plan_id));
    
    if (plan) {
      // 计算到期时间
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setMonth(expiresAt.getMonth() + plan.duration_months);
      
      // 创建用户订阅
      await ArticleSupabase.createUserSubscription({
        user_id,
        plan_id: parseInt(plan_id),
        expires_at: expiresAt.toISOString()
      });
      
      console.log(`用户 ${user_id} 成功订阅 ${plan.name}，到期时间: ${expiresAt.toISOString()}`);
    }
    
  } catch (error) {
    console.error('处理结账完成错误:', error);
  }
}

// 处理支付意图成功
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('支付成功:', paymentIntent.id);
    
    // 更新支付记录状态
    if (supabase) {
      await supabase
        .from('payment_records')
        .update({ status: 'succeeded' })
        .eq('stripe_payment_intent_id', paymentIntent.id);
    }
  } catch (error) {
    console.error('处理支付成功错误:', error);
  }
}

// 处理支付意图失败
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log('支付失败:', paymentIntent.id);
    
    // 更新支付记录状态
    if (supabase) {
      await supabase
        .from('payment_records')
        .update({ status: 'failed' })
        .eq('stripe_payment_intent_id', paymentIntent.id);
    }
  } catch (error) {
    console.error('处理支付失败错误:', error);
  }
}