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

    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    if (!username) {
      return NextResponse.json(
        { error: '缺少用户名参数', success: false },
        { status: 400 }
      );
    }

    // 验证用户名格式
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return NextResponse.json({
        success: true,
        available: false,
        reason: '用户名格式不正确'
      });
    }

    const available = await ArticleSupabase.checkUsernameAvailable(username, session.user.id);
    
    return NextResponse.json({
      success: true,
      available
    });
  } catch (error) {
    console.error('检查用户名可用性失败:', error);
    return NextResponse.json(
      { error: '检查失败', success: false },
      { status: 500 }
    );
  }
}