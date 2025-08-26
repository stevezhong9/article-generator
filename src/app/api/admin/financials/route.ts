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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // month, week, year
    
    const result = await ArticleSupabase.getFinancialStats(period);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('获取财务数据失败:', error);
    return NextResponse.json(
      { 
        error: '获取财务数据失败',
        success: false
      },
      { status: 500 }
    );
  }
}