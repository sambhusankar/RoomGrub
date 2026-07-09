import { NextResponse } from 'next/server';
import { backendJson } from '@/utils/backend';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const data = await backendJson(`/api/v1/rooms/${id}/members`);
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: err.detail || 'Failed to fetch members' }, { status: err.status || 500 });
    }
}
