---
name: GPTZero API behavior
description: Provider-specific request and failure behavior for the live AI detector.
---

Call GPTZero's text prediction endpoint with `x-api-key` and `{ "document": text }`; do not send the obsolete `multilingual` field.

**Why:** The old integration silently returned null for every provider failure. GPTZero rejected one credential with HTTP 403 “API key has no owner,” and the current valid key passed only after the request body and diagnostics were corrected.

**How to apply:** Keep fallback detection for runtime resilience, but preserve a safe last-error status for Diagnostics so credential, subscription, response-shape, and network failures are distinguishable without exposing the key.