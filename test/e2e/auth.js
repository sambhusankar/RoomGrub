// Test-only auth helpers. Bypasses the real Google OAuth flow by forging the
// same cookies src/app/api/auth/login/route.js sets, since middleware.js and
// src/auth/index.js only base64url-decode rg_token and check `exp` — they
// don't verify a signature client-side (the real backend does that).
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

async function loginAs(context, baseURL, { email = 'e2e-user@example.com', name = 'E2E User' } = {}) {
    const url = new URL(baseURL);
    await context.addCookies([
        {
            name: 'rg_token',
            value: buildFakeJWT({ email }),
            domain: url.hostname,
            path: '/',
            httpOnly: true,
            sameSite: 'Lax',
        },
        {
            name: 'rg_user',
            value: encodeURIComponent(JSON.stringify({ name, email, profile: null })),
            domain: url.hostname,
            path: '/',
            httpOnly: false,
            sameSite: 'Lax',
        },
    ]);
}

module.exports = { buildFakeJWT, loginAs };
