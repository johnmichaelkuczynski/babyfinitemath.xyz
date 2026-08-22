import type { RequestHandler } from "express";
import "express-session";
import { storage } from "./storage";

declare module "express-session" {
  interface SessionData {
    // Set once per session after the first request is recorded as a visit,
    // so we insert exactly one visit row per browser session.
    visitRecorded?: boolean;
  }
}

// Compatibility exports for existing AI routes. The course no longer has a
// login wall or output cap, so every request is admitted and output is unmetered.
export function checkMeter(..._args: unknown[]): true {
  return true;
}
export function recordAiOutput(..._args: unknown[]): void {}

// Record one visit per browser session. Runs on every request but inserts a
// row only the first time a session is seen (flag stored on the session).
// Captures only an anonymous session id; this public course has no accounts.
export const trackVisit: RequestHandler = (req, _res, next) => {
  if (req.session && !req.session.visitRecorded) {
    req.session.visitRecorded = true;
    storage
      .recordVisit(null, null, req.sessionID)
      .catch((err: unknown) => {
        // Non-fatal: never block a request over analytics bookkeeping.
        // eslint-disable-next-line no-console
        console.error("Failed to record visit:", err);
        // Allow a retry on the next request if the insert failed.
        if (req.session) req.session.visitRecorded = false;
      });
  }
  next();
};
