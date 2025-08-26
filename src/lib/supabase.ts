import { createClient } from '@supabase/supabase-js';
import { MarketingData } from '@/components/MarketingInfo';

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// 只有在配置存在时才创建客户端
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// 用户配置表结构
export interface UserProfile {
  id: number;
  user_id: string;
  email: string;
  name: string;
  avatar_url?: string;
  username?: string; // 自定义英文用户名
  bio?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}

// 数据库表结构定义
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
  user_id?: string; // 文章所属用户
  username?: string; // 冗余存储，方便查询
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
  user_id?: string;
  username?: string;
}

export class ArticleSupabase {
  // 创建文章
  static async createArticle(data: CreateArticleData): Promise<Article> {
    if (!supabase) {
      throw new Error('Supabase未配置，请设置环境变量 NEXT_PUBLIC_SUPABASE_URL 和 NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    const { data: article, error } = await supabase
      .from('articles')
      .insert([{
        slug: data.slug,
        title: data.title,
        content: data.content,
        description: data.description,
        author: data.author,
        publish_date: data.publish_date,
        source_url: data.source_url,
        marketing_data: data.marketing_data,
        user_id: data.user_id,
        username: data.username
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase创建文章错误:', error);
      throw new Error(`创建文章失败: ${error.message}`);
    }

    console.log(`文章已保存到Supabase: ${article.slug}`);
    return article as Article;
  }

  // 通过slug获取文章
  static async getArticleBySlug(slug: string): Promise<Article | null> {
    if (!supabase) {
      throw new Error('Supabase未配置，请设置环境变量');
    }

    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 没有找到记录
        return null;
      }
      console.error('Supabase获取文章错误:', error);
      throw new Error(`获取文章失败: ${error.message}`);
    }

    return article as Article;
  }

  // 获取最近的文章列表
  static async getRecentArticles(limit: number = 10): Promise<Article[]> {
    if (!supabase) {
      return [];
    }

    const { data: articles, error } = await supabase
      .from('articles')
      .select('id, slug, title, description, author, created_at, marketing_data')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase获取最近文章错误:', error);
      throw new Error(`获取最近文章失败: ${error.message}`);
    }

    return articles as Article[];
  }

  // 按作者搜索文章
  static async getArticlesByAuthor(author: string, limit: number = 20): Promise<Article[]> {
    if (!supabase) {
      return [];
    }

    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .ilike('author', `%${author}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase按作者搜索错误:', error);
      throw new Error(`按作者搜索失败: ${error.message}`);
    }

    return articles as Article[];
  }

  // 全文搜索文章
  static async searchArticles(query: string, limit: number = 20): Promise<Article[]> {
    if (!supabase) {
      return [];
    }

    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,author.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase全文搜索错误:', error);
      throw new Error(`搜索文章失败: ${error.message}`);
    }

    return articles as Article[];
  }

  // 删除文章
  static async deleteArticle(slug: string): Promise<boolean> {
    if (!supabase) {
      throw new Error('Supabase未配置，请设置环境变量');
    }

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('slug', slug);

    if (error) {
      console.error('Supabase删除文章错误:', error);
      throw new Error(`删除文章失败: ${error.message}`);
    }

    return true;
  }

  // 获取文章统计信息
  static async getStats(): Promise<{ totalArticles: number }> {
    if (!supabase) {
      return { totalArticles: 0 };
    }

    const { count, error } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase获取统计信息错误:', error);
      throw new Error(`获取统计信息失败: ${error.message}`);
    }

    return {
      totalArticles: count || 0
    };
  }

  // 检查数据库连接
  static async ping(): Promise<string> {
    if (!supabase) {
      throw new Error('Supabase未配置');
    }

    try {
      // 简单查询来测试连接
      const { data, error } = await supabase
        .from('articles')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Supabase ping error:', error);
        throw error;
      }
      
      return 'pong';
    } catch (error) {
      console.error('Ping method error:', error);
      throw new Error(`数据库连接失败: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    }
  }

  // ===== 用户管理功能 =====
  
  // 获取用户配置
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!supabase) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('获取用户配置错误:', error);
      return null;
    }

    return profile as UserProfile;
  }

  // 更新用户配置
  static async updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile | null> {
    if (!supabase) {
      throw new Error('Supabase未配置');
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update(data)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('更新用户配置错误:', error);
      throw new Error(`更新用户配置失败: ${error.message}`);
    }

    return profile as UserProfile;
  }

  // 检查用户名是否可用
  static async checkUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    let query = supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username);

    if (excludeUserId) {
      query = query.neq('user_id', excludeUserId);
    }

    const { data, error } = await query.single();

    if (error && error.code === 'PGRST116') {
      // 没有找到重复的用户名，可用
      return true;
    }

    // 找到重复的用户名或其他错误，不可用
    return false;
  }

  // 通过用户名获取用户配置
  static async getUserProfileByUsername(username: string): Promise<UserProfile | null> {
    if (!supabase) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('通过用户名获取用户配置错误:', error);
      return null;
    }

    return profile as UserProfile;
  }

  // 获取用户的文章列表
  static async getUserArticles(username: string, limit: number = 20): Promise<Article[]> {
    if (!supabase) {
      return [];
    }

    const { data: articles, error } = await supabase
      .from('articles')
      .select('*')
      .eq('username', username)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('获取用户文章列表错误:', error);
      return [];
    }

    return articles as Article[];
  }

  // 通过用户名和slug获取文章
  static async getArticleByUsernameAndSlug(username: string, slug: string): Promise<Article | null> {
    if (!supabase) {
      return null;
    }

    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('username', username)
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('通过用户名和slug获取文章错误:', error);
      return null;
    }

    return article as Article;
  }
}