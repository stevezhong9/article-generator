import { NextResponse } from 'next/server';
import { ArticleSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 从Supabase获取最近10篇文章
    const articles = await ArticleSupabase.getRecentArticles(10);
    
    // 转换格式以兼容前端
    const recentArticles = articles.map(article => ({
      slug: article.slug,
      title: article.title,
      url: `/${article.slug}`,
      savedAt: article.created_at,
      description: article.description,
      author: article.author
    }));
    
    return NextResponse.json({
      success: true,
      data: recentArticles
    });
  } catch (error) {
    console.error('获取最近文章失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '获取最近文章失败',
        data: []
      },
      { status: 500 }
    );
  }
}