import { NextResponse } from 'next/server';
import db from '@/database';
import webpush from 'web-push';

// Configure VAPID details
webpush.setVapidDetails(
  'mailto:your-email@domain.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();
    console.log(body)
    const { subscription, userId, roomId } = body;

    if (!subscription || !userId || !roomId) {
      return NextResponse.json(
        { error: 'Missing required fields: subscription, userId, roomId' },
        { status: 400 }
      );
    }

    // Check if subscription already exists for this user and room
    const existingSubscription = await db.PushSubscription.findOne({
      where: {
        user_id: userId,
        room_id: roomId
      }
    });

    if (existingSubscription) {
      // Update existing subscription
      await existingSubscription.update({
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        updated_at: new Date()
      });
    } else {
      // Create new subscription
      await db.PushSubscription.create({
        user_id: userId,
        room_id: roomId,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roomId = searchParams.get('roomId');

    if (!userId || !roomId) {
      return NextResponse.json(
        { error: 'Missing userId or roomId parameters' },
        { status: 400 }
      );
    }

    const subscription = await db.PushSubscription.findOne({
      where: {
        user_id: userId,
        room_id: roomId
      }
    });

    if (!subscription) {
      return NextResponse.json({ subscribed: false });
    }

    return NextResponse.json({
      subscribed: true,
      subscription: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh_key,
          auth: subscription.auth_key
        }
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const roomId = searchParams.get('roomId');

    if (!userId || !roomId) {
      return NextResponse.json(
        { error: 'Missing userId or roomId parameters' },
        { status: 400 }
      );
    }

    await db.PushSubscription.destroy({
      where: {
        user_id: userId,
        room_id: roomId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}