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
- **Next.js 15** (App Router, server-first)
- **Supabase** — auth (OAuth via Google) + PostgreSQL database
- **Sequelize 6** — ORM for PostgreSQL (`@database` alias → `src/database/`)
- **MUI Joy UI** — primary component library
- **Tailwind CSS** — utility styles alongside MUI
- **PWA** — `@ducanh2912/next-pwa` with hand-written service worker (`src/sw.js`)
- **Web Push** — VAPID-based push notifications

### Routing Structure
```
/                          # My Rooms dashboard (home)
/(auth)/login              # Google OAuth login (no navbar layout)
/(auth)/callback           # OAuth callback
/create_room               # Create a new room
/invite/[token]            # Accept invite link
/[room_id]/                # Room dashboard
/[room_id]/expenses        # Expense list
/[room_id]/members         # Members & balances
/[room_id]/splits          # Settlement calculations
/[room_id]/addgroccery     # Add expense (admin only)
/[room_id]/settings        # Settings & activity log
```

### Auth & Authorization
- `middleware.ts` runs `updateSession()` on every request to refresh Supabase session cookies; unauthenticated users are redirected to `/login`
- Server-side policies in `src/policies/`: `LoginRequired.js` (auth check) and `validRoom.js` (membership check via `UserRooms` table)
- User roles: **admin** (add expenses, manage members) and **member** (read-only). Checked via `useUserRole()` hook or `getUserRoomForRoom()` in `src/auth/index.js`

### Data Layer
- **Sequelize models** in `src/database/models/` define the schema: `Users`, `Rooms`, `UserRooms`, `Spendings`, `Balance`, `Invite`, `Notification`, `PushSubscription`
- **Supabase client** used directly for queries: server-side via `src/utils/supabase/server.ts`, client-side via `src/utils/supabase/client.ts`
- Pages are async Server Components; React `cache()` provides request-level deduplication (see `src/auth/index.js`)
- No React Query or GraphQL — direct Supabase calls in Server Components

### Notifications
- Push notifications use VAPID keys; subscription stored in `PushSubscription` model
- `src/services/NotificationService.js` POSTs to `/api/notifications`; failures are gracefully ignored (don't fail the triggering operation)
- Activity log stored in `Notification` model, shown at `/[room_id]/settings`

### Path Aliases
- `@/*` → `src/*`
- `@database` → `src/database`

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_DB_URL              # PostgreSQL connection string (server-only)
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT
```

### Key Patterns
- Most files are `.js`/`.jsx`; TypeScript (`strict: false`) used selectively
- Models use `module.exports` (CommonJS); auth/utils use ES module `export`
- Jest tests live in `src/__tests__/` and mock Supabase table queries directly
- CI runs `npm test` on all branches via `.github/workflows/ci.yml`
