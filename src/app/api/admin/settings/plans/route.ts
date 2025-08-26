import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ArticleSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录', success: false },
        { status: 401 }
      );
    }

    const userProfile = await ArticleSupabase.getUserProfile(session.user.id);
    if (userProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足', success: false },
        { status: 403 }
      );
    }

    const plans = await ArticleSupabase.getSubscriptionPlans();
    
    return NextResponse.json({
      success: true,
      data: plans
    });
  } catch (error) {
    console.error('获取套餐列表失败:', error);
    return NextResponse.json(
      { 
        error: '获取套餐列表失败',
        success: false
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录', success: false },
        { status: 401 }
      );
    }

    const userProfile = await ArticleSupabase.getUserProfile(session.user.id);
    if (userProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足', success: false },
        { status: 403 }
      );
    }

    const planData = await request.json();
    const result = await ArticleSupabase.createOrUpdatePlan(planData);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('创建/更新套餐失败:', error);
    return NextResponse.json(
      { 
        error: '创建/更新套餐失败',
        success: false
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录', success: false },
        { status: 401 }
      );
    }

    const userProfile = await ArticleSupabase.getUserProfile(session.user.id);
    if (userProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足', success: false },
        { status: 403 }
      );
    }

    const { id, ...planData } = await request.json();
    const result = await ArticleSupabase.updatePlan(id, planData);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('更新套餐失败:', error);
    return NextResponse.json(
      { 
        error: '更新套餐失败',
        success: false
      },
      { status: 500 }
    );
  }
}