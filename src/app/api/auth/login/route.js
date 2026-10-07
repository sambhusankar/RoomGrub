import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { REFRESH_COOKIE, USER_COOKIE, sessionCookieOptions } from '@/auth/constants';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request) {
    try {
        const { provider, token } = await request.json();

        const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ provider, token }),
        });

        const data = await res.json();

        if (!res.ok) {
            return NextResponse.json({ error: data.detail || 'Login failed' }, { status: res.status });
        }

        // Only the refresh token is persisted. middleware.js exchanges it for an
        // access token, which it keeps in memory.
        const { refresh_token, user } = data;

        const cookieStore = await cookies();
        cookieStore.set(REFRESH_COOKIE, refresh_token, sessionCookieOptions({ httpOnly: true }));
        cookieStore.set(
            USER_COOKIE,
            JSON.stringify({ email: user.email, name: user.name, profile: user.profile }),
            sessionCookieOptions({ httpOnly: false }),
        );

        return NextResponse.json({ success: true, user });
    } catch {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
