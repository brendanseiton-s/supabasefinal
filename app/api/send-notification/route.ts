import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const { userEmail, articleTitle, articleId, likerName, type = 'like' } = await request.json();

    // Validate required fields
    if (!userEmail || !articleTitle || !articleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const action = type === 'comment' ? 'commented on' : 'liked';
    const subject = type === 'comment' ? `Someone commented on your article: ${articleTitle}` : `Someone liked your article: ${articleTitle}`;

    // Send email notification only if API key is available
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      try {
        await resend.emails.send({
          from: 'notifications@yourdomain.com', // Replace with your verified domain
          to: userEmail,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Article ${type === 'comment' ? 'Commented' : 'Liked'}!</h2>
              <p>Hi there!</p>
              <p><strong>${likerName || 'Someone'}</strong> ${action} your article:</p>
              <h3>${articleTitle}</h3>
              <p>Check it out on our platform!</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/articles/${articleId}"
                 style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                View Article
              </a>
              <p>Keep up the great work!</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        // Continue with in-memory notification even if email fails
      }
    }

    // Also store notification in database
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    ) : null;

    if (supabase) {
      // Get user ID from email
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();

      if (profile) {
        await supabase
          .from('notifications')
          .insert({
            user_id: profile.id,
            type: type,
            message: `${likerName || 'Someone'} ${action} your article: "${articleTitle}"`,
            related_article_id: articleId
          });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent'
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userEmail = request.nextUrl.searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    // Get notifications for user from database
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user ID from email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (!profile) {
      return NextResponse.json({
        success: true,
        notifications: [],
        unreadCount: 0
      });
    }

    const { data: userNotifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50);

    return NextResponse.json({
      success: true,
      notifications: userNotifications || [],
      unreadCount: (userNotifications || []).filter((n) => !n.read).length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
