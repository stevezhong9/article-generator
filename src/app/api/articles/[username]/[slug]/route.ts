import { NextRequest, NextResponse } from 'next/server';
import { ArticleSupabase } from '@/lib/supabase';

interface ArticlePageProps {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: ArticlePageProps) {
  try {
    const resolvedParams = await params;
    const { username, slug } = resolvedParams;
    
    console.log('API 获取用户文章:', username, slug);
    
    // 从Supabase获取文章和用户信息
    const article = await ArticleSupabase.getArticleByUsernameAndSlug(username, slug);
    const userProfile = await ArticleSupabase.getUserProfileByUsername(username);
    
    if (!article || !userProfile) {
      return NextResponse.json(
        {
          success: false,
          error: '文章或用户未找到'
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
      url: `/${username}/${article.slug}`,
      markdown: article.content, // 暂时使用content作为markdown
      username: article.username
    };

    const userProfileData = {
      username: userProfile.username,
      name: userProfile.name,
      bio: userProfile.bio,
      website: userProfile.website,
      avatar_url: userProfile.avatar_url
    };
    
    return NextResponse.json({
      success: true,
      data: {
        article: articleData,
        userProfile: userProfileData
      }
    });
  } catch (error) {
    console.error('获取用户文章失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '获取文章失败'
      },
      { status: 500 }
    );
  }
}