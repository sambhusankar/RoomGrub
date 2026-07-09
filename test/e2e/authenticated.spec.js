const { test, expect } = require('@playwright/test');
const { loginAs } = require('./auth');

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

test.describe('authenticated access', () => {
    test.beforeEach(async ({ context, baseURL }) => {
        await loginAs(context, baseURL);
    });

    for (const route of PROTECTED_ROUTES) {
        test(`${route} succeeds without redirecting to /login`, async ({ page }) => {
            await page.goto(route);
            await expect(page).not.toHaveURL(/\/login/);
        });
    }
});
