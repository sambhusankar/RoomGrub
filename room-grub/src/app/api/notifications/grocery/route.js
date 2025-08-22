import { NextResponse } from 'next/server';
import { NotificationService } from '@/utils/notificationService';
import db from '@/database';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log(body)
    const { roomId, userId, itemName, amount } = body;

    if (!roomId || !userId || !itemName || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: roomId, userId, itemName, amount' },
        { status: 400 }
      );
    }

    // Get user information
    const user = await db.User.findByPk(userId);
    console.log('User:', user);
    console.log('body:', body);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Send notification
    await NotificationService.sendGroceryNotification(
      roomId,
      userId,
      user.name,
      itemName,
      amount
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending grocery notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}