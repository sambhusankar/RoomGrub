const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';

export async function apiCall(path, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(`${SITE_URL}${path}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (response.status === 204) return null;

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.detail || `HTTP ${response.status}`);
    }

    return data;
}
