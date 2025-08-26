import { NextResponse } from 'next/server';
import { testDatabaseConnection, initializeDatabase } from '@/lib/supabase-init';

export async function GET() {
  try {
    // 测试数据库连接
    const connectionTest = await testDatabaseConnection();
    
    if (!connectionTest.success) {
      // 尝试初始化数据库
      console.log('连接失败，尝试初始化数据库...');
      const initialized = await initializeDatabase();
      
      if (!initialized) {
        throw new Error(`数据库连接和初始化都失败: ${connectionTest.error}`);
      }
    }

    return NextResponse.json({
      success: true,
      status: 'healthy',
      database: {
        connected: true,
        message: connectionTest.message || '数据库连接正常'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('健康检查失败:', error);
    
    return NextResponse.json(
      {
        success: false,
        status: 'unhealthy',
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}