const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = 'http://localhost:3001';

module.exports = defineConfig({
    testDir: './test/e2e',
    fullyParallel: true,
    reporter: 'list',
    use: {
        baseURL: BASE_URL,
        trace: 'retain-on-failure',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: [
        {
            command: 'node test/e2e/mock-backend.js',
            port: 8000,
            reuseExistingServer: !process.env.CI,
        },
        {
            command: 'npm run build && npm start',
            url: BASE_URL,
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
            env: {
                NEXT_PUBLIC_BACKEND_URL: 'http://localhost:8000',
            },
        },
    ],
});
