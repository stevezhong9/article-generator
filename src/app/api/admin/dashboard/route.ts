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

    // 检查管理员权限
    const userProfile = await ArticleSupabase.getUserProfile(session.user.id);
    if (userProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: '权限不足', success: false },
        { status: 403 }
      );
    }

    // 获取统计数据
    const stats = await ArticleSupabase.getDashboardStats();
    
    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('获取仪表板数据失败:', error);
    return NextResponse.json(
      { 
        error: '获取数据失败',
        success: false
      },
      { status: 500 }
    );
  }
}