import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      article_id,
      reporter_name,
      reporter_email,
      reporter_organization,
      copyright_owner,
      infringement_description,
      original_work_description,
      infringing_urls,
      contact_address,
      phone_number,
      good_faith_statement,
      accuracy_statement,
      authorization_statement,
      electronic_signature
    } = body;

    // Validate required fields
    const requiredFields = [
      'article_id',
      'reporter_name', 
      'reporter_email',
      'copyright_owner',
      'infringement_description',
      'original_work_description',
      'infringing_urls',
      'good_faith_statement',
      'accuracy_statement',
      'authorization_statement',
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
    if (!emailRegex.test(reporter_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate URLs
    if (!Array.isArray(infringing_urls) || infringing_urls.length === 0) {
      return NextResponse.json(
        { error: 'At least one infringing URL must be provided' },
        { status: 400 }
      );
    }

    // Insert copyright report
    const { data: report, error: insertError } = await supabaseAdmin
      .from('copyright_reports')
      .insert({
        article_id,
        reporter_name,
        reporter_email,
        reporter_organization,
        copyright_owner,
        infringement_description,
        original_work_description,
        infringing_urls,
        contact_address,
        phone_number,
        good_faith_statement,
        accuracy_statement,
        authorization_statement,
        electronic_signature,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting copyright report:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit copyright report' },
        { status: 500 }
      );
    }

    // Send notification email to DMCA agent (optional - requires email setup)
    try {
      // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
      // Example notification to admin team
      console.log('DMCA Notice Received:', {
        reportId: report.id,
        article: article_id,
        reporter: reporter_email,
        copyright_owner
      });
    } catch (emailError) {
      console.error('Error sending notification email:', emailError);
      // Don't fail the request if email fails
    }

    // Auto-flag content as potentially infringing (optional)
    if (report.id) {
      try {
        // Mark the article as having a pending copyright report
        await supabaseAdmin
          .from('articles')
          .update({ 
            copyright_status: 'reported',
            updated_at: new Date().toISOString()
          })
          .eq('id', article_id);
      } catch (updateError) {
        console.error('Error updating article copyright status:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      report_id: report.id,
      message: 'Copyright report submitted successfully. We will review it within 24 hours.',
      next_steps: [
        'Your report has been forwarded to our designated DMCA agent',
        'We will investigate the reported content within 24 hours',
        'If valid, the infringing content will be removed promptly',
        'You will receive an email update on the status of your report'
      ]
    });

  } catch (error) {
    console.error('Copyright report submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get copyright reports (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const article_id = searchParams.get('article_id');
    
    // Build query
    let query = supabaseAdmin
      .from('copyright_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (article_id) {
      query = query.eq('article_id', article_id);
    }

    const { data: reports, error } = await query;

    if (error) {
      console.error('Error fetching copyright reports:', error);
      return NextResponse.json(
        { error: 'Failed to fetch copyright reports' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reports: reports || []
    });

  } catch (error) {
    console.error('Error fetching copyright reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}