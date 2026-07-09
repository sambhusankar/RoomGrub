'use server';
import { NextResponse } from 'next/server';

// Push notification storage/delivery is pending backend support — this is a
// no-op stub until the Python backend exposes notifications/subscriptions endpoints.
export async function POST(request) {
    const { roomId, triggeredBy, activityType, title, message } = await request.json();

    if (!roomId || !activityType || !title || !message) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        );
    }

    return NextResponse.json({
        success: true,
        pushNotificationsSent: 0,
    });
}
