import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ArticleSupabase } from '@/lib/supabase';

// 获取用户配置
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录', success: false },
        { status: 401 }
      );
    }

    const profile = await ArticleSupabase.getUserProfile(session.user.id);
    
    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('获取用户配置失败:', error);
    return NextResponse.json(
      { error: '获取配置失败', success: false },
      { status: 500 }
    );
  }
}

// 更新用户配置
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录', success: false },
        { status: 401 }
      );
    }

    const { username, bio, website } = await request.json();
    
    // 验证用户名格式
    if (username && !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return NextResponse.json(
        { error: '用户名格式不正确', success: false },
        { status: 400 }
      );
    }

    // 检查用户名是否已被使用
    if (username) {
      const available = await ArticleSupabase.checkUsernameAvailable(username, session.user.id);
      if (!available) {
        return NextResponse.json(
          { error: '用户名已被使用', success: false },
          { status: 400 }
        );
      }
    }

    const updatedProfile = await ArticleSupabase.updateUserProfile(session.user.id, {
      username: username || null,
      bio: bio || null,
      website: website || null
    });

    return NextResponse.json({
      success: true,
      data: updatedProfile
    });
  } catch (error) {
    console.error('更新用户配置失败:', error);
    return NextResponse.json(
      { error: '更新配置失败', success: false },
      { status: 500 }
    );
  }
}