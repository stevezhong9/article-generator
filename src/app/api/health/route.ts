import { NextResponse } from 'next/server';
import { ArticleSupabase } from '@/lib/supabase';

export async function GET() {
  try {
    // 测试Supabase连接
    const pingResult = await ArticleSupabase.ping();
    const stats = await ArticleSupabase.getStats();

    return NextResponse.json({
      success: true,
      status: 'healthy',
      supabase: {
        ping: pingResult,
        stats: stats,
        connected: true
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('健康检查失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        supabase: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}