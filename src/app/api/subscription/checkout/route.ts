import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { ArticleSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录', success: false },
        { status: 401 }
      );
    }

    const { planId } = await request.json();
    
    if (!planId) {
      return NextResponse.json(
        { error: '缺少套餐ID', success: false },
        { status: 400 }
      );
    }

    // 获取套餐信息
    const plans = await ArticleSupabase.getSubscriptionPlans();
    const selectedPlan = plans.find(p => p.id === planId);
    
    if (!selectedPlan) {
      return NextResponse.json(
        { error: '套餐不存在', success: false },
        { status: 404 }
      );
    }

    // 创建订单记录
    const order = await ArticleSupabase.createOrder({
      user_id: session.user.id,
      plan_id: planId,
      amount_usd: selectedPlan.price_usd
    });

    if (!order) {
      return NextResponse.json(
        { error: '创建订单失败', success: false },
        { status: 500 }
      );
    }

    // 创建Stripe结账会话
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `SharetoX ${selectedPlan.name}`,
              description: selectedPlan.description,
            },
            unit_amount: Math.round(selectedPlan.price_usd * 100), // 转换为分
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: session.user.id,
        plan_id: planId.toString(),
        order_id: order.id.toString()
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/subscription/pricing`,
      customer_email: session.user.email || undefined,
    });

    // 更新订单，关联Stripe会话ID
    await ArticleSupabase.updateOrderStatus(order.id, 'pending', {
      stripe_session_id: checkoutSession.id
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url
      }
    });

  } catch (error) {
    console.error('创建结账会话失败:', error);
    return NextResponse.json(
      { 
        error: '创建支付会话失败',
        success: false
      },
      { status: 500 }
    );
  }
}