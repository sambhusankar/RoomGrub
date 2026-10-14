export const REFRESH_COOKIE = 'rg_token'
export const USER_COOKIE = 'rg_user'

// Request header carrying the access token from middleware to server code.
// Middleware overwrites it on every request, so a client-sent value never gets through.
export const ACCESS_TOKEN_HEADER = 'x-rg-access-token'

// Matches the backend's REFRESH_TOKEN_EXPIRY_DAYS default.
export const SESSION_MAX_AGE = 60 * 60 * 24 * 90

export function sessionCookieOptions({ httpOnly }) {
    return {
        httpOnly,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_MAX_AGE,
    }
}
