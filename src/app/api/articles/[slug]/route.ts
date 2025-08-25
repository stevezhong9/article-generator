import { NextRequest, NextResponse } from 'next/server';
import { ArticleSupabase } from '@/lib/supabase';

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: ArticlePageProps) {
  try {
    const resolvedParams = await params;
    const { slug } = resolvedParams;
    
    console.log('API 获取文章:', slug);
    
    // 从Supabase获取文章
    const article = await ArticleSupabase.getArticleBySlug(slug);
    
    if (!article) {
      return NextResponse.json(
        {
          success: false,
          error: '文章未找到'
        },
        { status: 404 }
      );
    }
    
    // 转换数据格式以兼容前端
    const articleData = {
      slug: article.slug,
      title: article.title,
      content: article.content,
      description: article.description,
      author: article.author,
      publishDate: article.publish_date,
      sourceUrl: article.source_url,
      marketingData: article.marketing_data,
      savedAt: article.created_at,
      url: `/${article.slug}`,
      markdown: article.content // 暂时使用content作为markdown
    };
    
    return NextResponse.json({
      success: true,
      data: articleData
    });
  } catch (error) {
    console.error('获取文章失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '获取文章失败'
      },
      { status: 500 }
    );
  }
}