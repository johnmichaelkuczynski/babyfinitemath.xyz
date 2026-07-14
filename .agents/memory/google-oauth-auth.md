---
name: Google OAuth auth
description: The app uses passport + google-oauth20 + express-session (not Clerk) for authentication. Key wiring, quirks, and domain requirements.
---

# Google OAuth auth (Passport + express-session)

Clerk was fully removed and replaced with real Google OAuth 2.0. All auth lives in `artifacts/api-server/src/auth.ts` (canonical implementation).

## Key facts

- **Backend:** `passport`, `passport-google-oauth20`, `express-session`, `connect-pg-simple` all installed in `@workspace/api-server`. Sessions stored in `user_sessions` postgres table (auto-created).
- **DB tables:** `users` (id, username, googleId, email, displayName) and `visits` (id, userId, email, visitedAt) added to `lib/db/src/schema/course.ts`; storage methods in `artifacts/api-server/src/lib/storage.ts`.
- **SESSION_SECRET:** Already configured as a Replit secret (auto-generated). Required in production or server throws.
- **Credentials read:** `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (also checks GOOGLE_LOGIN_* and GOOGLE_OAUTH_* prefixes for compatibility).
- **Routes:** `GET /api/auth/google` → Google redirect; `GET /auth/google/callback` → session save → `redirect /`; `GET /api/auth/user` → `{authenticated, user}` JSON; `POST /api/auth/logout` → destroys session.

## Frontend

- Clerk removed from `@workspace/qr-course` entirely (packages + index.css layer + all imports).
- `src/hooks/useAuth.ts` — `useAuth()` queries `/api/auth/user` with `credentials:"include"` (staleTime 30s); `useLogout()` POSTs to `/api/auth/logout` then redirects to `/`.
- `App.tsx` — no ClerkProvider; `protectedComponent` HOC reads `useAuth()` and redirects to `/` if unauthenticated.
- `Landing.tsx` — both "Sign in" and "Get started" are plain `<a href="/api/auth/google">` (not wouter Links); no sign-up route exists.
- `Layout.tsx` TopBar — uses `useAuth()` for user email display; `useLogout()` for sign-out button.

## Domain requirements

Production domain `basicfinitemath.ink` and `www.basicfinitemath.ink` are hard-coded in `trustedHosts`; `REPLIT_DOMAINS` entries are added dynamically. Any domain whose callback URI is registered in Google Cloud Console will work.

**Why:** The dev `REPLIT_DEV_DOMAIN` changes on every workspace restart, so the dev callback URL changes too. For dev testing, either add the current dev domain to Google Cloud OAuth, or test via the production domain.

## Wiring order in app.ts

`setupAuth(app)` must be called AFTER `express.json()` / `express.urlencoded()` (session and passport middleware need the body parsers) and BEFORE `app.use("/api", router)`.
