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
  marketing_data?: MarketingData; // 用户品牌营销信息
  role?: string; // 用户角色：user, admin
  daily_article_count?: number; // 今日文章数量
  last_article_date?: string; // 最后发布文章日期
  created_at: string;
  updated_at: string;
}

// 订阅套餐
export interface SubscriptionPlan {
  id: number;
  name: string;
  description: string;
  price_usd: number;
  duration_months: number;
  daily_article_limit: number | null;
  stripe_price_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 用户订阅
export interface UserSubscription {
  id: number;
  user_id: string;
  plan_id: number;
  status: 'active' | 'expired' | 'cancelled';
  started_at: string;
  expires_at: string;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

// 订单
export interface Order {
  id: number;
  user_id: string;
  plan_id: number;
  amount_usd: number;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  metadata: Record<string, unknown>;
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
  view_count?: number; // 浏览量
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

  // 增加文章浏览量
  static async incrementViewCount(articleId: number): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    try {
      const { error } = await supabase.rpc('increment_view_count', {
        article_id: articleId
      });

      if (error) {
        console.error('增加浏览量失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('增加浏览量异常:', error);
      return false;
    }
  }

  // 通过slug增加浏览量（兼容旧格式）
  static async incrementViewCountBySlug(slug: string): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    try {
      const { error } = await supabase.rpc('increment_view_count_by_slug', {
        article_slug: slug
      });

      if (error) {
        console.error('通过slug增加浏览量失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('通过slug增加浏览量异常:', error);
      return false;
    }
  }

  // 通过用户名和slug增加浏览量
  static async incrementViewCountByUsernameAndSlug(username: string, slug: string): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    try {
      const { error } = await supabase.rpc('increment_view_count_by_username_slug', {
        article_username: username,
        article_slug: slug
      });

      if (error) {
        console.error('通过用户名和slug增加浏览量失败:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('通过用户名和slug增加浏览量异常:', error);
      return false;
    }
  }

  // ===== 订阅和会员管理功能 =====

  // 获取所有套餐
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    if (!supabase) {
      return [];
    }

    const { data: plans, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_usd', { ascending: true });

    if (error) {
      console.error('获取套餐列表错误:', error);
      return [];
    }

    return plans as SubscriptionPlan[];
  }

  // 获取用户当前订阅
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    if (!supabase) {
      return null;
    }

    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('获取用户订阅错误:', error);
      return null;
    }

    return subscription as UserSubscription || null;
  }

  // 检查用户是否为VIP
  static async isUserVip(userId: string): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('is_user_vip', {
        user_id_param: userId
      });

      if (error) {
        console.error('检查VIP状态错误:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('检查VIP状态异常:', error);
      return false;
    }
  }

  // 检查用户今日是否可以创建文章
  static async canUserCreateArticle(userId: string): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('can_user_create_article', {
        user_id_param: userId
      });

      if (error) {
        console.error('检查文章创建权限错误:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('检查文章创建权限异常:', error);
      return false;
    }
  }

  // 增加用户今日文章使用量
  static async incrementUserDailyUsage(userId: string): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    try {
      const { error } = await supabase.rpc('increment_user_daily_usage', {
        user_id_param: userId
      });

      if (error) {
        console.error('增加用户使用量错误:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('增加用户使用量异常:', error);
      return false;
    }
  }

  // 创建订单
  static async createOrder(orderData: {
    user_id: string;
    plan_id: number;
    amount_usd: number;
    stripe_session_id?: string;
  }): Promise<Order | null> {
    if (!supabase) {
      throw new Error('Supabase未配置');
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error('创建订单错误:', error);
      throw new Error(`创建订单失败: ${error.message}`);
    }

    return order as Order;
  }

  // 更新订单状态
  static async updateOrderStatus(orderId: number, status: string, metadata?: Record<string, unknown>): Promise<boolean> {
    if (!supabase) {
      return false;
    }

    const updateData: Partial<Order> = {
      status,
      updated_at: new Date().toISOString()
    };

    if (metadata) {
      updateData.metadata = metadata;
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId);

    if (error) {
      console.error('更新订单状态错误:', error);
      return false;
    }

    return true;
  }

  // 创建用户订阅
  static async createUserSubscription(subscriptionData: {
    user_id: string;
    plan_id: number;
    expires_at: string;
    stripe_subscription_id?: string;
  }): Promise<UserSubscription | null> {
    if (!supabase) {
      throw new Error('Supabase未配置');
    }

    const { data: subscription, error } = await supabase
      .from('user_subscriptions')
      .insert([subscriptionData])
      .select()
      .single();

    if (error) {
      console.error('创建用户订阅错误:', error);
      throw new Error(`创建订阅失败: ${error.message}`);
    }

    return subscription as UserSubscription;
  }

  // ===== 管理后台功能 =====

  // 获取用户列表（分页）
  static async getUsers(page: number = 1, pageSize: number = 20, search?: string): Promise<{users: UserProfile[], total: number}> {
    if (!supabase) {
      return { users: [], total: 0 };
    }

    let query = supabase
      .from('user_profiles')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,username.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error('获取用户列表错误:', error);
      return { users: [], total: 0 };
    }

    return {
      users: users as UserProfile[] || [],
      total: count || 0
    };
  }

  // 获取文章列表（分页）
  static async getArticlesWithPagination(page: number = 1, pageSize: number = 20, search?: string): Promise<{articles: Article[], total: number}> {
    if (!supabase) {
      return { articles: [], total: 0 };
    }

    let query = supabase
      .from('articles')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,username.ilike.%${search}%`);
    }

    const { data: articles, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error('获取文章列表错误:', error);
      return { articles: [], total: 0 };
    }

    return {
      articles: articles as Article[] || [],
      total: count || 0
    };
  }

  // 获取订单列表（分页）
  static async getOrders(page: number = 1, pageSize: number = 20, search?: string, status?: string): Promise<{orders: Order[], total: number}> {
    if (!supabase) {
      return { orders: [], total: 0 };
    }

    let query = supabase
      .from('orders')
      .select(`
        *,
        user_profiles(name, email, username),
        subscription_plans(name, description)
      `, { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`user_profiles.name.ilike.%${search}%,user_profiles.email.ilike.%${search}%,user_profiles.username.ilike.%${search}%,stripe_payment_intent_id.ilike.%${search}%`);
    }

    const { data: orders, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error('获取订单列表错误:', error);
      return { orders: [], total: 0 };
    }

    return {
      orders: orders || [],
      total: count || 0
    };
  }

  // 获取统计数据
  static async getDashboardStats(): Promise<{
    totalUsers: number;
    totalArticles: number;
    totalViews: number;
    totalRevenue: number;
    vipUsers: number;
    todayArticles: number;
  }> {
    if (!supabase) {
      return {
        totalUsers: 0,
        totalArticles: 0,
        totalViews: 0,
        totalRevenue: 0,
        vipUsers: 0,
        todayArticles: 0
      };
    }

    try {
      // 并行获取各种统计数据
      const [
        { count: totalUsers },
        { count: totalArticles },
        { data: viewsData },
        { data: revenueData },
        { count: vipUsers },
        { count: todayArticles }
      ] = await Promise.all([
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('view_count'),
        supabase.from('payment_records').select('amount_usd').eq('status', 'succeeded'),
        supabase.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active').gt('expires_at', new Date().toISOString()),
        supabase.from('articles').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0])
      ]);

      const totalViews = viewsData?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0;
      const totalRevenue = revenueData?.reduce((sum, payment) => sum + parseFloat(payment.amount_usd || '0'), 0) || 0;

      return {
        totalUsers: totalUsers || 0,
        totalArticles: totalArticles || 0,
        totalViews,
        totalRevenue,
        vipUsers: vipUsers || 0,
        todayArticles: todayArticles || 0
      };
    } catch (error) {
      console.error('获取统计数据错误:', error);
      return {
        totalUsers: 0,
        totalArticles: 0,
        totalViews: 0,
        totalRevenue: 0,
        vipUsers: 0,
        todayArticles: 0
      };
    }
  }

  // 获取财务统计数据
  static async getFinancialStats(period: string = 'month'): Promise<{
    totalRevenue: number;
    periodRevenue: number;
    totalOrders: number;
    periodOrders: number;
    averageOrderValue: number;
    recentPayments: Order[];
    revenueChart: { date: string; revenue: number; orders: number }[];
    topPlans: { planName: string; revenue: number; orders: number }[];
  }> {
    if (!supabase) {
      return {
        totalRevenue: 0,
        periodRevenue: 0,
        totalOrders: 0,
        periodOrders: 0,
        averageOrderValue: 0,
        recentPayments: [],
        revenueChart: [],
        topPlans: []
      };
    }

    try {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'month':
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      // 获取总收入和订单数
      const { data: allOrders } = await supabase
        .from('orders')
        .select('amount_usd, created_at')
        .eq('status', 'paid');

      const { data: periodOrders } = await supabase
        .from('orders')
        .select('amount_usd, created_at')
        .eq('status', 'paid')
        .gte('created_at', startDate.toISOString());

      // 获取最近的支付记录
      const { data: recentPayments } = await supabase
        .from('payment_records')
        .select(`
          *,
          orders(
            user_profiles(name, email, username),
            subscription_plans(name)
          )
        `)
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false })
        .limit(10);

      // 获取套餐收入统计
      const { data: planStats } = await supabase
        .from('orders')
        .select(`
          amount_usd,
          subscription_plans(name)
        `)
        .eq('status', 'paid');

      // 计算基础统计
      const totalRevenue = allOrders?.reduce((sum, order) => sum + order.amount_usd, 0) || 0;
      const periodRevenueAmount = periodOrders?.reduce((sum, order) => sum + order.amount_usd, 0) || 0;
      const totalOrdersCount = allOrders?.length || 0;
      const periodOrdersCount = periodOrders?.length || 0;
      const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

      // 生成图表数据（按日期分组）
      const revenueChart: { date: string; revenue: number; orders: number }[] = [];
      const dateMap = new Map<string, { revenue: number; orders: number }>();

      periodOrders?.forEach(order => {
        const date = order.created_at.split('T')[0];
        const existing = dateMap.get(date) || { revenue: 0, orders: 0 };
        dateMap.set(date, {
          revenue: existing.revenue + order.amount_usd,
          orders: existing.orders + 1
        });
      });

      // 填充图表数据
      const daysDiff = Math.ceil((now.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000));
      for (let i = 0; i < daysDiff; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const data = dateMap.get(dateStr) || { revenue: 0, orders: 0 };
        revenueChart.push({
          date: dateStr,
          revenue: data.revenue,
          orders: data.orders
        });
      }

      // 计算套餐统计
      const planMap = new Map<string, { revenue: number; orders: number }>();
      planStats?.forEach(order => {
        const planName = (order.subscription_plans as { name?: string })?.name || '未知套餐';
        const existing = planMap.get(planName) || { revenue: 0, orders: 0 };
        planMap.set(planName, {
          revenue: existing.revenue + order.amount_usd,
          orders: existing.orders + 1
        });
      });

      const topPlans = Array.from(planMap.entries())
        .map(([planName, data]) => ({
          planName,
          revenue: data.revenue,
          orders: data.orders
        }))
        .sort((a, b) => b.revenue - a.revenue);

      return {
        totalRevenue,
        periodRevenue: periodRevenueAmount,
        totalOrders: totalOrdersCount,
        periodOrders: periodOrdersCount,
        averageOrderValue,
        recentPayments: recentPayments || [],
        revenueChart,
        topPlans
      };
    } catch (error) {
      console.error('获取财务统计错误:', error);
      return {
        totalRevenue: 0,
        periodRevenue: 0,
        totalOrders: 0,
        periodOrders: 0,
        averageOrderValue: 0,
        recentPayments: [],
        revenueChart: [],
        topPlans: []
      };
    }
  }

  // 创建或更新套餐
  static async createOrUpdatePlan(planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .insert([planData])
        .select()
        .single();

      if (error) {
        console.error('创建套餐错误:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('创建套餐错误:', error);
      return null;
    }
  }

  // 更新套餐
  static async updatePlan(id: number, planData: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .update({
          ...planData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('更新套餐错误:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('更新套餐错误:', error);
      return null;
    }
  }

  // 切换套餐状态
  static async togglePlanStatus(id: number, isActive: boolean): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { error } = await supabase
        .from('subscription_plans')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('切换套餐状态错误:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('切换套餐状态错误:', error);
      return false;
    }
  }
}