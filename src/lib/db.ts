import { sql } from '@vercel/postgres';
import { MarketingData } from '@/components/MarketingInfo';

export interface Article {
  id: number;
  slug: string;
  title: string;
  content: string;
  description?: string;
  author?: string;
  publish_date?: string;
  source_url?: string;
  marketing_data?: MarketingData;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleData {
  slug: string;
  title: string;
  content: string;
  description?: string;
  author?: string;
  publish_date?: string;
  source_url?: string;
  marketing_data?: MarketingData;
}

export class ArticleDB {
  // 创建文章
  static async createArticle(data: CreateArticleData): Promise<Article> {
    const { rows } = await sql`
      INSERT INTO articles (
        slug, title, content, description, author, 
        publish_date, source_url, marketing_data
      ) VALUES (
        ${data.slug}, 
        ${data.title}, 
        ${data.content}, 
        ${data.description || null},
        ${data.author || null},
        ${data.publish_date || null},
        ${data.source_url || null},
        ${data.marketing_data ? JSON.stringify(data.marketing_data) : null}
      )
      RETURNING *
    `;
    
    return rows[0] as Article;
  }

  // 通过slug获取文章
  static async getArticleBySlug(slug: string): Promise<Article | null> {
    const { rows } = await sql`
      SELECT * FROM articles WHERE slug = ${slug} LIMIT 1
    `;
    
    if (rows.length === 0) return null;
    
    const article = rows[0] as Article;
    // 解析JSON字段
    if (article.marketing_data && typeof article.marketing_data === 'string') {
      article.marketing_data = JSON.parse(article.marketing_data);
    }
    
    return article;
  }

  // 获取最近的文章列表
  static async getRecentArticles(limit: number = 10): Promise<Article[]> {
    const { rows } = await sql`
      SELECT id, slug, title, description, author, created_at, marketing_data
      FROM articles 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    
    return rows.map(row => {
      const article = row as Article;
      // 解析JSON字段
      if (article.marketing_data && typeof article.marketing_data === 'string') {
        article.marketing_data = JSON.parse(article.marketing_data);
      }
      return article;
    });
  }

  // 按作者搜索文章
  static async getArticlesByAuthor(author: string, limit: number = 20): Promise<Article[]> {
    const { rows } = await sql`
      SELECT * FROM articles 
      WHERE author ILIKE ${`%${author}%`}
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    
    return rows.map(row => {
      const article = row as Article;
      if (article.marketing_data && typeof article.marketing_data === 'string') {
        article.marketing_data = JSON.parse(article.marketing_data);
      }
      return article;
    });
  }

  // 全文搜索文章
  static async searchArticles(query: string, limit: number = 20): Promise<Article[]> {
    const { rows } = await sql`
      SELECT *, ts_rank(to_tsvector('english', title || ' ' || COALESCE(description, '')), plainto_tsquery(${query})) as rank
      FROM articles 
      WHERE to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ plainto_tsquery(${query})
      ORDER BY rank DESC, created_at DESC
      LIMIT ${limit}
    `;
    
    return rows.map(row => {
      const article = row as Article;
      if (article.marketing_data && typeof article.marketing_data === 'string') {
        article.marketing_data = JSON.parse(article.marketing_data);
      }
      return article;
    });
  }

  // 初始化数据库表
  static async initializeDatabase(): Promise<void> {
    await sql`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        description TEXT,
        author VARCHAR(255),
        publish_date TIMESTAMP,
        source_url TEXT,
        marketing_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // 创建索引
    await sql`CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_articles_title ON articles USING gin(to_tsvector('english', title))`;
  }
}