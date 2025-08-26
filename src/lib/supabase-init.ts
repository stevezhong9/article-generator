import { supabase } from './supabase';

// 初始化数据库表
export async function initializeDatabase() {
  if (!supabase) {
    console.error('Supabase未配置');
    return false;
  }

  try {
    console.log('正在初始化数据库表...');

    // 创建articles表的SQL
    const createTableSQL = `
      -- 创建文章表
      CREATE TABLE IF NOT EXISTS public.articles (
          id BIGSERIAL PRIMARY KEY,
          slug VARCHAR(255) UNIQUE NOT NULL,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          description TEXT,
          author VARCHAR(255),
          publish_date TIMESTAMPTZ,
          source_url TEXT,
          marketing_data JSONB,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- 创建索引
      CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
      CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);

      -- 启用行级安全
      ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

      -- 创建策略：允许所有人操作
      DO $$
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'articles' AND policyname = '文章公开可读'
          ) THEN
              CREATE POLICY "文章公开可读" ON public.articles FOR SELECT USING (true);
          END IF;

          IF NOT EXISTS (
              SELECT 1 FROM pg_policies 
              WHERE tablename = 'articles' AND policyname = '允许插入文章'
          ) THEN
              CREATE POLICY "允许插入文章" ON public.articles FOR INSERT WITH CHECK (true);
          END IF;
      END
      $$;
    `;

    // 执行SQL
    const { error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (error) {
      console.error('创建表失败:', error);
      // 尝试简单的查询来测试连接
      const { data, error: testError } = await supabase
        .from('articles')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('数据库连接测试失败:', testError);
        return false;
      }
      
      console.log('表可能已存在，连接正常');
      return true;
    }

    console.log('数据库表初始化成功');
    return true;
  } catch (error) {
    console.error('数据库初始化错误:', error);
    return false;
  }
}

// 测试数据库连接
export async function testDatabaseConnection() {
  if (!supabase) {
    return { success: false, error: 'Supabase未配置' };
  }

  try {
    // 尝试简单查询
    const { data, error } = await supabase
      .from('articles')
      .select('id')
      .limit(1);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: '数据库连接正常' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
}