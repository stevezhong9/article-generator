import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function GET() {
  try {
    // 检查是否有KV配置
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.log('开发环境：返回空的最近文章列表');
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const recentArticles = await kv.get('articles:recent') as any[] || [];
    
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