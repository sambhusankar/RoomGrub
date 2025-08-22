import { NextResponse } from 'next/server';
import { NotificationService } from '@/utils/notificationService';
import db from '@/database';

export async function POST(request) {
  try {
    const body = await request.json();
    const { roomId, payerId, amount, receiverEmail } = body;

    if (!roomId || !payerId || !amount || !receiverEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: roomId, payerId, amount, receiverEmail' },
        { status: 400 }
      );
    }

    // Get payer and receiver information
    const [payer, receiver] = await Promise.all([
      db.User.findByPk(payerId),
      db.User.findOne({ where: { email: receiverEmail } })
    ]);

    if (!payer || !receiver) {
      return NextResponse.json(
        { error: 'Payer or receiver not found' },
        { status: 404 }
      );
    }

    // Send notification
    await NotificationService.sendPaymentNotification(
      roomId,
      payerId,
      payer.name,
      amount,
      receiver.name
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending payment notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}