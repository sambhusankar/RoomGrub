const { test, expect } = require('@playwright/test');
const { loginAs, MISSING_ROOM_ID } = require('./auth');

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

    test('/ redirects to /rooms', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveURL(/\/rooms$/);
    });

    test.describe('last opened room', () => {
        const setLastRoom = (context, baseURL, value) =>
            context.addCookies([{ name: 'rg_last_room', value: String(value), url: baseURL }]);
        const lastRoomCookie = async (context) =>
            (await context.cookies()).find((c) => c.name === 'rg_last_room')?.value;

        test('/ redirects to the last opened room', async ({ page, context, baseURL }) => {
            await setLastRoom(context, baseURL, 2);
            await page.goto('/');
            await expect(page).toHaveURL(/\/2$/);
        });

        test('/ falls back to /rooms when the last room is no longer accessible', async ({ page, context, baseURL }) => {
            await setLastRoom(context, baseURL, MISSING_ROOM_ID);
            await page.goto('/');
            await expect(page).toHaveURL(/\/rooms$/);
        });

        test('/ falls back to /rooms when the cookie is not a room id', async ({ page, context, baseURL }) => {
            await setLastRoom(context, baseURL, 'not-a-room');
            await page.goto('/');
            await expect(page).toHaveURL(/\/rooms$/);
        });

        test('opening a room remembers it for the next launch', async ({ page, context }) => {
            await page.goto('/2');
            await expect.poll(() => lastRoomCookie(context)).toBe('2');
            await page.goto('/');
            await expect(page).toHaveURL(/\/2$/);
        });

        test('a room under /<room_id>/... is remembered too', async ({ page, context }) => {
            await page.goto('/2/expenses');
            expect(await lastRoomCookie(context)).toBe('2');
        });

        test('a room the user cannot open only bounces / to /rooms', async ({ page }) => {
            await page.goto(`/${MISSING_ROOM_ID}`);
            await expect(page).toHaveURL(/\/rooms$/);
            await page.goto('/');
            await expect(page).toHaveURL(/\/rooms$/);
        });

        test('the cookie is httpOnly', async ({ page, context }) => {
            await page.goto('/2');
            const cookie = (await context.cookies()).find((c) => c.name === 'rg_last_room');
            expect(cookie?.httpOnly).toBe(true);
        });
    });
});
