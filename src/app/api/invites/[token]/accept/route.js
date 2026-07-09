import { NextResponse } from 'next/server';
import { backendJson } from '@/utils/backend';

export async function POST(request, { params }) {
    try {
        const { token } = await params;
        const data = await backendJson(`/api/v1/invites/${token}/accept`, { method: 'POST' });
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: err.detail || 'Failed to accept invite' }, { status: err.status || 400 });
    }
}
