# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 3001
npm run build        # Production build
npm start            # Run production build on port 3001
npm run lint         # ESLint via Next.js
npm test             # Run all Jest tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

To run a single test file:
```bash
npx jest src/__tests__/business/addGrocery.test.js
```

## Architecture

**RoomGrub** is a shared expense-splitting app for roommates. Users create "rooms", invite members, log spending, and settle balances.

### Tech Stack
- **Next.js 15** (App Router, server-first) as a BFF (backend-for-frontend) in front of a separate **Python FastAPI** backend (`RoomGrub-backend`, not in this repo) that owns the database and business logic
- **Google Identity Services** (`@react-oauth/google`) — login issues an id_token, exchanged for a backend-issued JWT
- **MUI Joy UI** — primary component library
- **Tailwind CSS** — utility styles alongside MUI
- **PWA** — `@ducanh2912/next-pwa` with hand-written service worker (`src/sw.js`)
- **Web Push** — VAPID-based push notifications (currently a no-op stub, see Notifications below)

### Routing Structure
```
/                          # My Rooms dashboard (home)
/(auth)/login              # Google OAuth login (no navbar layout)
/create_room               # Create a new room
/invite/[token]            # Accept invite link
/[room_id]/                # Room dashboard
/[room_id]/expenses        # Expense list
/[room_id]/members         # Members & balances
/[room_id]/splits          # Settlement calculations
/[room_id]/addgroccery     # Add expense (admin only)
/[room_id]/settings        # Settings & activity log
```

### Data Flow (BFF proxy pattern)
```
App (client + server actions) → Next.js app/api routes → Python FastAPI backend
```
- `src/utils/backend.js` — `server-only` helper for use inside Next.js API routes / server actions; reads the `rg_token` JWT cookie and calls the Python backend directly (`NEXT_PUBLIC_BACKEND_URL`, default `http://localhost:8000`). `backendJson()` throws `{ status, detail }` on non-2xx responses — callers must read `error.detail`, not `error.message`
- `src/app/api/**` — Next.js API routes that proxy specific calls to the Python backend (auth login, invite accept, room members) for use from client components
- `src/utils/api.js` — client/server helper (`apiCall`) that calls the Next.js API routes above (not the Python backend directly); throws a real `Error`
- Most data fetching happens directly in `'use server'` action files (e.g. `src/app/[room_id]/actions.js`) calling `backendJson()` against `/api/v1/...` backend endpoints

### Auth & Authorization
- Login: Google Identity `GoogleLogin` component → id_token → `POST /api/auth/login` (`src/app/api/auth/login/route.js`) → Python backend returns `{ access_token, user }` → stored as an httpOnly `rg_token` cookie (JWT) plus a non-httpOnly `rg_user` cookie (`{ name, email, profile }` for display only)
- Session: `auth()` in `src/auth/index.js` decodes `rg_token` (base64, no signature verification client-side — the backend verifies the signature on every proxied request) and checks `exp`
- `middleware.js` redirects unauthenticated requests to `/login` based on `rg_token` presence/expiry; `PUBLIC_PATHS` (`/login`, `/callback`, `/invite`) are exempt
- Server-side policies in `src/policies/`: `LoginRequired.js` (auth check) and `validRoom.js` (membership check via `getUserRoomForRoom()`, which calls the backend's `/api/v1/rooms/:id/members`)
- User roles: **admin** (add expenses, manage members) and **member** (read-only). Checked via `useUserRole()` hook (client, via `apiCall`) or `getUserRoomForRoom()` in `src/auth/index.js` (server)
- Sign out: `signOut()` in `src/auth/index.js` deletes the `rg_token` + `rg_user` cookies

### Data Layer
- No ORM/database access from this repo — all persistence lives in the Python FastAPI backend. This app only calls backend REST endpoints under `/api/v1/...` via `backendJson()`
- Pages are async Server Components; React `cache()` provides request-level deduplication for `auth()` and `getUserRoomForRoom()` (see `src/auth/index.js`)
- No React Query or GraphQL — direct backend calls in server actions, occasionally proxied through Next.js API routes for client components

### Notifications
- `src/services/NotificationService.js` POSTs to `/api/notifications`; failures are gracefully ignored (don't fail the triggering operation)
- `/api/notifications` (`src/app/api/notifications/route.js`) is currently a **no-op stub** — push notification storage/delivery is pending backend support in the Python service; it validates the payload and returns `{ success: true, pushNotificationsSent: 0 }` without sending anything

### Path Aliases
- `@/*` → `src/*`

### Environment Variables
```
NEXT_PUBLIC_BACKEND_URL       # FastAPI backend base URL (default http://localhost:8000)
NEXT_PUBLIC_GOOGLE_CLIENT_ID  # Google OAuth client ID (@react-oauth/google)
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
```

### Key Patterns
- Most files are `.js`/`.jsx`; TypeScript (`strict: false`) used selectively
- Server action files use `'use server'` + ES module `export`
- Errors thrown by `backendJson()` are plain objects `{ status, detail }` — always read `error.detail` in catch blocks, not `error.message`
- No Jest tests currently exist for business logic (removed during the backend migration, not yet replaced); `npm test` will pass trivially until new tests are added
- CI runs `npm test` on all branches via `.github/workflows/ci.yml`
