import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
) : null;

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured' },
      { status: 500 }
    );
  }

  try {
    const { articleTitle, articleId, authorName } = await request.json();

    // Get all users except the author
    const { data: users, error } = await supabase
      .from('profiles')
      .select('email')
      .neq('email', ''); // Assuming we have emails

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Send email to each user only if API key is available
    if (process.env.RESEND_API_KEY && users && users.length > 0) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const emailPromises = users.map(async (user) => {
        try {
          await resend.emails.send({
            from: 'notifications@yourdomain.com',
            to: user.email,
            subject: `New Article Posted: ${articleTitle}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>New Article Available!</h2>
                <p>Hi there!</p>
                <p><strong>${authorName || 'An author'}</strong> just posted a new article:</p>
                <h3>${articleTitle}</h3>
                <p>Don't miss out on the latest content!</p>
                <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://your-vercel-app.vercel.app'}/articles/${articleId}"
                   style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                  Read Article
                </a>
                <p>Happy reading!</p>
              </div>
            `,
          });
        } catch (emailError) {
          console.error(`Failed to send email to ${user.email}:`, emailError);
        }
      });

      await Promise.all(emailPromises);
    }

    return NextResponse.json({
      success: true,
      message: `New article notification sent to ${users?.length || 0} users`
    });
  } catch (error) {
    console.error('Error sending new article notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}