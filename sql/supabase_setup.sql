-- 创建文章表 (在Supabase SQL编辑器中运行)
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

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_author ON public.articles(author);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON public.articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_title_search ON public.articles USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_articles_content_search ON public.articles USING GIN (to_tsvector('english', content));

-- 创建函数自动更新 updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
DROP TRIGGER IF EXISTS update_articles_updated_at ON public.articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 启用行级安全 (RLS)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许所有人读取文章
CREATE POLICY "文章公开可读" ON public.articles
    FOR SELECT USING (true);

-- 创建策略：允许所有人插入文章 (可以根据需要调整)
CREATE POLICY "允许插入文章" ON public.articles
    FOR INSERT WITH CHECK (true);

-- 创建策略：允许所有人更新文章 (可以根据需要调整)
CREATE POLICY "允许更新文章" ON public.articles
    FOR UPDATE USING (true);

-- 创建策略：允许所有人删除文章 (可以根据需要调整)
CREATE POLICY "允许删除文章" ON public.articles
    FOR DELETE USING (true);

-- 创建全文搜索函数
CREATE OR REPLACE FUNCTION public.search_articles(query_text TEXT)
RETURNS SETOF public.articles AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.articles
    WHERE
        to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || content) 
        @@ plainto_tsquery('english', query_text)
    ORDER BY
        ts_rank(
            to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || content),
            plainto_tsquery('english', query_text)
        ) DESC,
        created_at DESC;
END;
$$ LANGUAGE plpgsql;