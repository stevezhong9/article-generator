import { Redis } from '@upstash/redis';
import { MarketingData } from '@/components/MarketingInfo';

// 创建Redis连接实例
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  description?: string;
  author?: string;
  publishDate?: string;
  sourceUrl?: string;
  marketingData?: MarketingData;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleData {
  slug: string;
  title: string;
  content: string;
  description?: string;
  author?: string;
  publishDate?: string;
  sourceUrl?: string;
  marketingData?: MarketingData;
}

export class ArticleRedis {
  // Redis键名生成
  private static getArticleKey(slug: string): string {
    return `article:${slug}`;
  }

  private static getRecentKey(): string {
    return 'articles:recent';
  }

  private static getAuthorKey(author: string): string {
    return `articles:author:${author.toLowerCase().replace(/\s+/g, '-')}`;
  }

  // 创建文章
  static async createArticle(data: CreateArticleData): Promise<Article> {
    const timestamp = new Date().toISOString();
    const article: Article = {
      id: `${data.slug}-${Date.now()}`,
      slug: data.slug,
      title: data.title,
      content: data.content,
      description: data.description,
      author: data.author,
      publishDate: data.publishDate,
      sourceUrl: data.sourceUrl,
      marketingData: data.marketingData,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // 保存文章主体
    await redis.set(this.getArticleKey(data.slug), article);

    // 更新最近文章列表 (保持最新10篇)
    const recentKey = this.getRecentKey();
    await redis.lpush(recentKey, JSON.stringify({
      slug: article.slug,
      title: article.title,
      description: article.description,
      author: article.author,
      createdAt: article.createdAt,
    }));
    
    // 保持列表长度为10
    await redis.ltrim(recentKey, 0, 9);

    // 如果有作者，添加到作者的文章列表
    if (data.author) {
      const authorKey = this.getAuthorKey(data.author);
      await redis.lpush(authorKey, data.slug);
      await redis.ltrim(authorKey, 0, 49); // 保持最多50篇文章
    }

    console.log(`文章已保存到Upstash Redis: ${article.slug}`);
    return article;
  }

  // 通过slug获取文章
  static async getArticleBySlug(slug: string): Promise<Article | null> {
    const article = await redis.get(this.getArticleKey(slug));
    
    if (!article) {
      return null;
    }

    // 如果返回的是字符串，需要解析
    if (typeof article === 'string') {
      return JSON.parse(article) as Article;
    }

    return article as Article;
  }

  // 获取最近的文章列表
  static async getRecentArticles(limit: number = 10): Promise<Article[]> {
    const recentData = await redis.lrange(this.getRecentKey(), 0, limit - 1);
    
    if (!recentData || recentData.length === 0) {
      return [];
    }

    // 解析JSON数据
    const articles = recentData.map(item => {
      if (typeof item === 'string') {
        return JSON.parse(item);
      }
      return item;
    });

    return articles as Article[];
  }

  // 按作者搜索文章
  static async getArticlesByAuthor(author: string, limit: number = 20): Promise<Article[]> {
    const authorKey = this.getAuthorKey(author);
    const slugs = await redis.lrange(authorKey, 0, limit - 1);
    
    if (!slugs || slugs.length === 0) {
      return [];
    }

    // 批量获取文章详情
    const articles: Article[] = [];
    for (const slug of slugs) {
      const article = await this.getArticleBySlug(slug as string);
      if (article) {
        articles.push(article);
      }
    }

    return articles;
  }

  // 搜索文章 (简单的标题匹配)
  static async searchArticles(query: string, limit: number = 20): Promise<Article[]> {
    // 获取最近的文章进行搜索
    const recentArticles = await this.getRecentArticles(100);
    const lowerQuery = query.toLowerCase();
    
    const matchedArticles = recentArticles.filter(article => 
      article.title.toLowerCase().includes(lowerQuery) ||
      (article.description && article.description.toLowerCase().includes(lowerQuery)) ||
      (article.author && article.author.toLowerCase().includes(lowerQuery))
    );

    return matchedArticles.slice(0, limit);
  }

  // 删除文章
  static async deleteArticle(slug: string): Promise<boolean> {
    const result = await redis.del(this.getArticleKey(slug));
    return result > 0;
  }

  // 检查连接状态
  static async ping(): Promise<string> {
    return await redis.ping();
  }

  // 获取数据库统计信息
  static async getStats(): Promise<{ totalArticles: number; recentCount: number }> {
    const recentCount = await redis.llen(this.getRecentKey());
    
    // 简单估算总文章数 (基于最近文章数)
    const totalArticles = recentCount;

    return {
      totalArticles,
      recentCount,
    };
  }
}