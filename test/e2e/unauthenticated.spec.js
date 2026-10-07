const { test, expect } = require('@playwright/test');
const { loginAs, REJECTED_REFRESH_TOKEN } = require('./auth');

const PROTECTED_ROUTES = [
    '/rooms',
    '/create_room',
    '/1',
    '/1/expenses',
    '/1/members',
    '/1/splits',
    '/1/addgroccery',
    '/1/settings',
];

test.describe('unauthenticated access', () => {
    for (const route of PROTECTED_ROUTES) {
        test(`${route} redirects to /login`, async ({ page }) => {
            await page.goto(route);
            await expect(page).toHaveURL(/\/login$/);
        });
    }

    test('/ shows the landing page without redirecting', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/$/);
    });

    test('a refresh token the backend rejects redirects to /login and clears the session cookies', async ({ page, context, baseURL }) => {
        await loginAs(context, baseURL, { refreshToken: REJECTED_REFRESH_TOKEN });
        await page.goto('/rooms');
        await expect(page).toHaveURL(/\/login$/);
        const names = (await context.cookies()).map((c) => c.name);
        expect(names).not.toContain('rg_token');
        expect(names).not.toContain('rg_user');
    });

    test('/invite/:token does not redirect to /login', async ({ page }) => {
        await page.goto('/invite/some-token');
        await expect(page).not.toHaveURL(/\/login/);
    });
});
