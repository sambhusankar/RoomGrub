const { test, expect } = require('@playwright/test');

const PROTECTED_ROUTES = [
    '/',
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

    test('/invite/:token does not redirect to /login', async ({ page }) => {
        await page.goto('/invite/some-token');
        await expect(page).not.toHaveURL(/\/login/);
    });
});
