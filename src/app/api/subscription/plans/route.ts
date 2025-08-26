import { NextRequest, NextResponse } from 'next/server';
import { ArticleSupabase } from '@/lib/supabase';

// 获取订阅套餐列表
export async function GET(request: NextRequest) {
  try {
    const plans = await ArticleSupabase.getSubscriptionPlans();
    
    return NextResponse.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('获取套餐列表失败:', error);
    return NextResponse.json(
      { 
        error: '获取套餐信息失败',
        success: false
      },
      { status: 500 }
    );
  }
}