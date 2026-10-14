import 'server-only';
import { headers } from 'next/headers';
import { ACCESS_TOKEN_HEADER } from '@/auth/constants';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function backendCall(path, options = {}) {
    // Attached by middleware.js, which keeps the access token in memory and refreshes it when needed.
    const token = (await headers()).get(ACCESS_TOKEN_HEADER);

    const requestHeaders = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${BACKEND_URL}${path}`, {
        ...options,
        headers: requestHeaders,
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
