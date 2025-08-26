import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const {
      copyright_report_id,
      counter_party_name,
      counter_party_email,
      counter_party_address,
      counter_party_phone,
      material_description,
      good_faith_statement,
      consent_to_jurisdiction,
      accept_service_of_process,
      electronic_signature
    } = body;

    // Validate required fields
    const requiredFields = [
      'copyright_report_id',
      'counter_party_name',
      'counter_party_email', 
      'counter_party_address',
      'material_description',
      'good_faith_statement',
      'consent_to_jurisdiction',
      'accept_service_of_process',
      'electronic_signature'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields', missing: missingFields },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(counter_party_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Verify the copyright report exists and is valid for counter-notice
    const { data: originalReport, error: reportError } = await supabaseAdmin
      .from('copyright_reports')
      .select('*')
      .eq('id', copyright_report_id)
      .eq('status', 'valid')
      .single();

    if (reportError || !originalReport) {
      return NextResponse.json(
        { error: 'Invalid or non-existent copyright report' },
        { status: 400 }
      );
    }

    // Check if user already submitted a counter-notice for this report
    const { data: existingCounterNotice } = await supabaseAdmin
      .from('counter_notifications')
      .select('id')
      .eq('copyright_report_id', copyright_report_id)
      .eq('user_id', session.user.id)
      .single();

    if (existingCounterNotice) {
      return NextResponse.json(
        { error: 'Counter-notice already submitted for this report' },
        { status: 400 }
      );
    }

    // Insert counter-notification
    const { data: counterNotice, error: insertError } = await supabaseAdmin
      .from('counter_notifications')
      .insert({
        copyright_report_id,
        user_id: session.user.id,
        counter_party_name,
        counter_party_email,
        counter_party_address,
        counter_party_phone,
        material_description,
        good_faith_statement,
        consent_to_jurisdiction,
        accept_service_of_process,
        electronic_signature,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting counter-notification:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit counter-notification' },
        { status: 500 }
      );
    }

    // Update original report to indicate counter-notice received
    await supabaseAdmin
      .from('copyright_reports')
      .update({ 
        counter_notice_received: true,
        status: 'counter_notice_received'
      })
      .eq('id', copyright_report_id);

    // Send notification emails (optional)
    try {
      console.log('Counter-Notice Received:', {
        counterNoticeId: counterNotice.id,
        originalReportId: copyright_report_id,
        user: session.user.email
      });
    } catch (emailError) {
      console.error('Error sending notification email:', emailError);
    }

    return NextResponse.json({
      success: true,
      counter_notice_id: counterNotice.id,
      message: 'Counter-notification submitted successfully',
      next_steps: [
        'Your counter-notification has been received and will be reviewed',
        'We will forward your counter-notice to the original complainant',
        'If no legal action is filed within 10-14 business days, content may be restored',
        'You will receive email updates on the status of your counter-notification'
      ]
    });

  } catch (error) {
    console.error('Counter-notification submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get counter-notifications for a user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data: counterNotices, error } = await supabaseAdmin
      .from('counter_notifications')
      .select(`
        *,
        copyright_reports!inner(
          id,
          article_id,
          copyright_owner,
          status,
          created_at
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching counter-notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch counter-notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      counter_notices: counterNotices || []
    });

  } catch (error) {
    console.error('Error fetching counter-notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}