import 'server-only';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function backendCall(path, options = {}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('rg_token')?.value;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${BACKEND_URL}${path}`, {
        ...options,
        headers,
    });

    return response;
}

export async function backendJson(path, options = {}) {
    const response = await backendCall(path, options);

    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
        throw { status: response.status, detail: data.detail || `HTTP ${response.status}` };
    }

    return data;
}
