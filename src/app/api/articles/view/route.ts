import { NextRequest, NextResponse } from 'next/server';
import { ArticleSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { username, slug } = await request.json();
    
    let success = false;
    
    if (username && slug) {
      // 用户文章格式
      success = await ArticleSupabase.incrementViewCountByUsernameAndSlug(username, slug);
    } else if (slug) {
      // 旧格式文章
      success = await ArticleSupabase.incrementViewCountBySlug(slug);
    }
    
    return NextResponse.json({
      success,
      message: success ? '浏览量已更新' : '更新浏览量失败'
    });
  } catch (error) {
    console.error('更新浏览量失败:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '更新浏览量失败'
      },
      { status: 500 }
    );
  }
}