// Minimal stand-in for the FastAPI backend, used only by the Playwright e2e suite.
// It answers the handful of /api/v1/... endpoints that authenticated-route
// pages hit during SSR, so pages guarded by `validRoom` (which checks room
// membership against the backend) can render without a real backend running.
const http = require('http');

const PORT = process.env.MOCK_BACKEND_PORT || 8000;

const MEMBER = {
    id: 1,
    user_id: 1,
    email: 'e2e-user@example.com',
    name: 'E2E User',
    profile: null,
    role: 'Admin',
};

function send(res, status, body) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
}

const server = http.createServer((req, res) => {
    const url = req.url.split('?')[0];

    if (/^\/api\/v1\/rooms\/[^/]+\/members$/.test(url)) {
        return send(res, 200, [MEMBER]);
    }
    if (/^\/api\/v1\/rooms\/[^/]+\/dashboard$/.test(url)) {
        return send(res, 200, { members: [MEMBER] });
    }
    if (/^\/api\/v1\/rooms\/[^/]+\/expenses$/.test(url)) {
        return send(res, 200, { items: [], next_cursor: null });
    }
    if (/^\/api\/v1\/rooms\/[^/]+\/splits$/.test(url)) {
        return send(res, 200, { unsettled_expenses: [], members: [] });
    }
    if (/^\/api\/v1\/rooms\/[^/]+$/.test(url)) {
        return send(res, 200, { total_spent: 0, pending_amount: 0, recent_expenses: [] });
    }
    if (url === '/api/v1/rooms') {
        return send(res, 200, [{ id: 1, name: 'E2E Room' }]);
    }

    return send(res, 404, { detail: 'Not found' });
});

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Mock backend listening on http://localhost:${PORT}`);
    });
}

module.exports = server;
