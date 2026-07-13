# Changelog

## 4.0.0

### Changed
- Migrated persistence and business logic from Supabase (Postgres + auth) to a separate Python FastAPI backend. This app now acts purely as a BFF (backend-for-frontend), proxying requests to the backend via `backendJson()` / Next.js API routes instead of querying the database directly.
- Replaced Supabase Auth with Google Identity Services (`@react-oauth/google`). Login now exchanges a Google `id_token` for a backend-issued JWT, stored in the `rg_token` httpOnly cookie.
- Reworked `middleware.js` (dropped the old `middleware.ts`) to gate routes based on `rg_token` presence/expiry instead of Supabase session cookies.
- Fixed invited by user name
- Moved the "My Rooms" dashboard from `/` to `/rooms`; `/` now redirects to `/rooms`.

### Fixed
- Post-login redirect no longer requires closing/reopening the app: replaced client-side `router.push` (which didn't reliably pick up the freshly-set auth cookie) with a hard `window.location.href` navigation after login and after invite acceptance.
- Promoting/demoting a room member (and removing a member) no longer fails with "Member not found" — `findMemberIdByEmail` was resolving the wrong id field (`id` instead of `user_id`) from the members list, which the backend's member sub-resource routes require.

### Removed
- Supabase client/server/middleware helpers (`src/utils/supabase/*`) and all Mongoose-style data models (`src/database/*`).
- OAuth callback route (`src/app/(auth)/callback/*`) and `useOfflineAuth` hook, no longer needed under the new auth flow.
- Old Jest business-logic tests (`src/__tests__/business/*`) that exercised the removed database layer.

### Added
- Playwright end-to-end test suite (`test/e2e`) with a mock backend, plus `npm run test:e2e`.
- New API route proxies under `src/app/api/{auth,invites,rooms}` and shared client helper `src/utils/api.js`.
