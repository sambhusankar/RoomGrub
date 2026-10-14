// Test-only auth helpers. Bypasses the real Google OAuth flow by setting the
// same cookies src/app/api/auth/login/route.js sets. rg_token holds an opaque
// refresh token, which middleware.js exchanges for an access token at the mock
// backend's /api/v1/auth/refresh. That access token is a forged JWT:
// src/auth/index.js only base64url-decodes it and checks `exp`, it doesn't
// verify a signature (the real backend does that).
function base64url(obj) {
    return Buffer.from(JSON.stringify(obj)).toString('base64url');
}

function buildFakeJWT({ sub = 1, email = 'e2e-user@example.com', exp } = {}) {
    const header = base64url({ alg: 'none', typ: 'JWT' });
    const payload = base64url({
        sub,
        email,
        exp: exp ?? Math.floor(Date.now() / 1000) + 3600,
    });
    return `${header}.${payload}.fake-signature`;
}

// The mock backend answers 401 when asked to refresh this token.
const REJECTED_REFRESH_TOKEN = 'e2e-rejected-refresh-token';

// The signed-in identity always comes from the mock backend (MEMBER in
// mock-backend.js), so there is no option to log in as a different user.
async function loginAs(
    context,
    baseURL,
    { name = 'E2E User', refreshToken = 'e2e-refresh-token' } = {},
) {
    const url = new URL(baseURL);
    await context.addCookies([
        {
            name: 'rg_token',
            value: refreshToken,
            domain: url.hostname,
            path: '/',
            httpOnly: true,
            sameSite: 'Lax',
        },
        {
            name: 'rg_user',
            value: encodeURIComponent(JSON.stringify({ name, email: 'e2e-user@example.com', profile: null })),
            domain: url.hostname,
            path: '/',
            httpOnly: false,
            sameSite: 'Lax',
        },
    ]);
}

module.exports = { buildFakeJWT, loginAs, REJECTED_REFRESH_TOKEN };
