import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ArticleSupabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { isActive } = await request.json();
    const resolvedParams = await params;
    const planId = parseInt(resolvedParams.id);
    
    const result = await ArticleSupabase.togglePlanStatus(planId, isActive);
    
    return NextResponse.json({
      success: result,
      message: result ? '状态更新成功' : '状态更新失败'
    });
  } catch (error) {
    console.error('切换套餐状态失败:', error);
    return NextResponse.json(
      { 
        error: '切换套餐状态失败',
        success: false
      },
      { status: 500 }
    );
  }
}