---
name: Open-access freemium model
description: How anonymous access, metering, visit tracking, and owner gating work after the login wall was removed.
---

- Anonymous users may use the whole app; AI-output chars are metered per session (`req.session.aiOutputChars`, limit 2000, `>=` check) → 401 `{error:"login_required"}`; frontend global handler shows a Google sign-in modal.
- **Why:** user mandate — no login wall, but force sign-in after ~two paragraphs of AI output.
- Destructive/expensive routers (`/api/detection`, `/api/diagnostics`, `/api/admin`) are owner-only in production via `isOwnerOrDev` (open in dev for dev@localhost auto-login). Gate is path-scoped in routes/index.ts — a bare `router.use(mw, subrouter)` would 403 EVERY /api request since subrouters mount at "/".
- Visit tracking: exactly one row per browser session via trackVisit middleware; do NOT also record in the OAuth callback (double counts).
- `visits.session_id` self-heals at boot in index.ts (CREATE TABLE IF NOT EXISTS + ADD COLUMN IF NOT EXISTS) because publish flow doesn't run schema push.
- Owner email lives once in `src/lib/metering.ts` (OWNER_EMAIL).
