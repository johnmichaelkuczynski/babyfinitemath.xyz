---
name: No-auth public course
description: Permanent public-access rule for the Prompt Engineering course.
---

The course must have no login system: no Google OAuth, account controls, auth endpoints, user identity checks, output quota, or sign-in modal. All course and AI learning features are public and unmetered.

**Why:** The user explicitly and emphatically mandated removal of all login.

**How to apply:** Keep only anonymous browser sessions for public course progress and once-per-session visit counting. Do not reintroduce authentication or a login-triggered AI limit. Because no owner identity exists, production-only destructive internal tools must remain disabled rather than protected by login.