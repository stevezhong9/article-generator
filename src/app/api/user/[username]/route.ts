import { NextRequest, NextResponse } from 'next/server';
import { ArticleSupabase } from '@/lib/supabase';

interface UserPageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function GET(request: NextRequest, { params }: UserPageProps) {
  try {
    const resolvedParams = await params;
    const { username } = resolvedParams;
    
    console.log('API 获取用户数据:', username);
    
    // 获取用户信息和文章列表
    const userProfile = await ArticleSupabase.getUserProfileByUsername(username);
    
    if (!userProfile) {
      return NextResponse.json(
        {
          success: false,
          error: '用户未找到'
        },
        { status: 404 }
      );
    }
    
    // 获取用户的文章列表
    const articles = await ArticleSupabase.getUserArticles(username);
    
    return NextResponse.json({
      success: true,
      data: {
        profile: {
          username: userProfile.username,
          name: userProfile.name,
          bio: userProfile.bio,
          website: userProfile.website,
          avatar_url: userProfile.avatar_url
        },
        articles: articles.map(article => ({
          slug: article.slug,
          title: article.title,
          description: article.description,
          created_at: article.created_at,
          marketing_data: article.marketing_data
        }))
      }
    });
  } catch (error) {
    console.error('获取用户数据失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: '获取用户数据失败'
      },
      { status: 500 }
    );
  }
}