import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

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
    
    // 检查是否有KV配置
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.log('开发环境：无KV配置，返回未找到');
      return NextResponse.json(
        {
          success: false,
          error: '开发环境：文章未找到'
        },
        { status: 404 }
      );
    }
    
    const article = await kv.get(`article:${slug}`);
    
    if (!article) {
      return NextResponse.json(
        {
          success: false,
          error: '文章未找到'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: article
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