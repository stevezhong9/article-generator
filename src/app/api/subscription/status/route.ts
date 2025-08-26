import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ArticleSupabase, supabase } from '@/lib/supabase';

// 获取用户订阅状态和使用量
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未登录', success: false },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // 并行获取用户信息
    const [subscription, isVip, canCreate] = await Promise.all([
      ArticleSupabase.getUserSubscription(userId),
      ArticleSupabase.isUserVip(userId),
      ArticleSupabase.canUserCreateArticle(userId)
    ]);

    // 获取今日使用量
    const today = new Date().toISOString().split('T')[0];
    let dailyUsage = 0;
    
    try {
      const { data } = await supabase
        ?.from('user_daily_usage')
        .select('articles_created')
        .eq('user_id', userId)
        .eq('usage_date', today)
        .single() || { data: null };
        
      dailyUsage = data?.articles_created || 0;
    } catch (error) {
      // 如果没有记录，使用量为0
      console.log('获取今日使用量:', error);
    }

    return NextResponse.json({
      success: true,
      data: {
        subscription,
        isVip,
        canCreate,
        dailyUsage,
        dailyLimit: isVip ? null : 3
      }
    });
  } catch (error) {
    console.error('获取订阅状态失败:', error);
    return NextResponse.json(
      { 
        error: '获取订阅状态失败',
        success: false
      },
      { status: 500 }
    );
  }
}