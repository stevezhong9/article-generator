import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false },
        { status: 401 }
      );
    }

    const { confirmDeletion, password } = await request.json();
    
    if (!confirmDeletion) {
      return NextResponse.json(
        { error: 'Deletion not confirmed', success: false },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Start transaction-like operations
    // Note: Supabase doesn't support transactions in the client SDK, 
    // so we'll handle this with careful ordering

    try {
      // 1. Cancel any active subscriptions (this would be handled by Stripe webhooks)
      // 2. Delete user-generated content (articles, etc.)
      await supabase?.from('articles').delete().eq('user_id', userId);
      
      // 3. Delete user subscriptions (keep order history for compliance)
      await supabase?.from('user_subscriptions').delete().eq('user_id', userId);
      
      // 4. Anonymize orders instead of deleting (for financial records compliance)
      await supabase?.from('orders').update({
        metadata: { deleted_user: true, deletion_date: new Date().toISOString() }
      }).eq('user_id', userId);
      
      // 5. Delete user profile
      await supabase?.from('user_profiles').delete().eq('user_id', userId);
      
      // 6. Delete authentication records
      await supabase?.from('users').delete().eq('id', userId);
      await supabase?.from('accounts').delete().eq('userId', userId);
      await supabase?.from('sessions').delete().eq('userId', userId);

      return NextResponse.json({
        success: true,
        message: 'Account successfully deleted'
      });

    } catch (deletionError) {
      console.error('Account deletion error:', deletionError);
      return NextResponse.json(
        { 
          error: 'Failed to delete account completely. Please contact support.',
          success: false
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete account',
        success: false
      },
      { status: 500 }
    );
  }
}

// GET endpoint to get deletion information
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

    // Get counts of data that will be deleted
    const [
      { count: articlesCount },
      { count: subscriptionsCount },
      { count: ordersCount }
    ] = await Promise.all([
      supabase?.from('articles').select('*', { count: 'exact', head: true }).eq('user_id', userId) || { count: 0 },
      supabase?.from('user_subscriptions').select('*', { count: 'exact', head: true }).eq('user_id', userId) || { count: 0 },
      supabase?.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', userId) || { count: 0 }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        articlesCount: articlesCount || 0,
        subscriptionsCount: subscriptionsCount || 0,
        ordersCount: ordersCount || 0,
        deletionPolicy: {
          immediate: ['User profile', 'Articles', 'Subscriptions'],
          anonymized: ['Order history (for financial compliance)'],
          retained: ['Payment records (for legal requirements)']
        }
      }
    });

  } catch (error) {
    console.error('Get deletion info error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get deletion information',
        success: false
      },
      { status: 500 }
    );
  }
}