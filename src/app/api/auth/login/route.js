import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

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

        const { access_token, user } = data;
        const isProd = process.env.NODE_ENV === 'production';

        const cookieStore = await cookies();
        cookieStore.set('rg_token', access_token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24,
        });
        cookieStore.set('rg_user', JSON.stringify({ email: user.email, name: user.name, profile: user.profile }), {
            httpOnly: false,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24,
        });

        return NextResponse.json({ success: true, user });
    } catch {
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
