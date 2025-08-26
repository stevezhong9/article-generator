import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ArticleSupabase, supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user profile
    const userProfile = await ArticleSupabase.getUserProfile(userId);
    
    // Get user articles
    const { data: articles } = await supabase
      ?.from('articles')
      .select('*')
      .eq('user_id', userId) || { data: [] };

    // Get user subscriptions
    const { data: subscriptions } = await supabase
      ?.from('user_subscriptions')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId) || { data: [] };

    // Get user orders
    const { data: orders } = await supabase
      ?.from('orders')
      .select('*, subscription_plans(*)')
      .eq('user_id', userId) || { data: [] };

    // Get payment records
    const { data: payments } = await supabase
      ?.from('payment_records')
      .select('*')
      .in('order_id', orders?.map(o => o.id) || []) || { data: [] };

    // Compile all user data
    const userData = {
      exportDate: new Date().toISOString(),
      exportType: 'GDPR_DATA_EXPORT',
      user: {
        profile: userProfile,
        articles: articles || [],
        subscriptions: subscriptions || [],
        orders: orders || [],
        payments: payments || []
      },
      metadata: {
        totalArticles: articles?.length || 0,
        totalOrders: orders?.length || 0,
        accountCreated: userProfile?.created_at,
        lastUpdated: userProfile?.updated_at
      }
    };

    // Return as downloadable JSON
    const response = NextResponse.json(userData);
    response.headers.set('Content-Disposition', `attachment; filename="user-data-export-${userId}-${new Date().toISOString().split('T')[0]}.json"`);
    response.headers.set('Content-Type', 'application/json');
    
    return response;

  } catch (error) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to export data',
        success: false
      },
      { status: 500 }
    );
  }
}