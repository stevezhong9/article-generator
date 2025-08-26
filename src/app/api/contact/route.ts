import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message, category } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All required fields must be filled', success: false },
        { status: 400 }
      );
    }

    // Store contact form submission in database
    if (supabase) {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([{
          name,
          email,
          subject,
          message,
          category,
          status: 'new',
          created_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error storing contact submission:', error);
      }
    }

    // In a real application, you would send an email notification here
    // For now, we'll just log the submission
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      category,
      message: message.substring(0, 100) + '...'
    });

    // Send confirmation email to user (optional)
    // await sendConfirmationEmail(email, name, subject);

    // Send notification to admin (optional)
    // await sendAdminNotification({ name, email, subject, message, category });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send message',
        success: false
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve contact submissions (admin only)
export async function GET(request: NextRequest) {
  try {
    // This would require admin authentication in a real app
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const status = searchParams.get('status') || '';

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not available', success: false },
        { status: 500 }
      );
    }

    let query = supabase
      .from('contact_submissions')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: submissions, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) {
      console.error('Error fetching contact submissions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch submissions', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        submissions: submissions || [],
        total: count || 0,
        page,
        pageSize
      }
    });

  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch submissions',
        success: false
      },
      { status: 500 }
    );
  }
}