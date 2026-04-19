import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory notification storage
const notifications: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const { userEmail, articleTitle, articleId, likerName } = await request.json();

    // Validate required fields
    if (!userEmail || !articleTitle || !articleId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create notification
    const notification = {
      id: Date.now(),
      userEmail,
      articleTitle,
      articleId,
      likerName: likerName || 'Someone',
      message: `${likerName || 'Someone'} liked your article: "${articleTitle}"`,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Store notification
    notifications.push(notification);

    // Simulate email sending (in production, use Resend, SendGrid, etc.)
    console.log(`Email sent to ${userEmail}: ${notification.message}`);

    return NextResponse.json({
      success: true,
      message: 'Notification sent',
      notification
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

    // Get notifications for user
    const userNotifications = notifications.filter(
      (n) => n.userEmail === userEmail
    );

    return NextResponse.json({
      success: true,
      notifications: userNotifications,
      unreadCount: userNotifications.filter((n) => !n.read).length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
