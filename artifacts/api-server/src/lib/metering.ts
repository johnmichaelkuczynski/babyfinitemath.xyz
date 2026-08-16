import type { Request, Response, RequestHandler } from "express";
import "express-session";
import { storage } from "./storage";

// The site owner. The visitor-analytics endpoint is restricted to this email
// (case-insensitive). Kept in one place so every gate agrees on who the owner is.
export const OWNER_EMAIL = "johnmichaelkuczynski@gmail.com";

// Freemium metering: anonymous visitors may use every read/practice/tutor
// endpoint, but only ~two paragraphs of AI-generated OUTPUT before they must
// sign in. Authenticated users are never metered.
export const ANON_OUTPUT_CHAR_LIMIT = 2000;

declare module "express-session" {
  interface SessionData {
    // Cumulative count of AI-generated output characters served to this
    // (anonymous) session. Never incremented for authenticated users.
    aiOutputChars?: number;
    // Set once per session after the first request is recorded as a visit,
    // so we insert exactly one visit row per browser session.
    visitRecorded?: boolean;
  }
}

// True when the request belongs to a signed-in user (passport session).
function isAuthed(req: Request): boolean {
  return typeof req.isAuthenticated === "function" && req.isAuthenticated();
}

// Enforce the freemium limit BEFORE generating any AI output. Returns true when
// the caller may proceed. When it returns false it has already sent a 401 JSON
// response and the caller must return immediately without generating.
//
// Authenticated users always pass. Anonymous users pass until their cumulative
// AI-output character count exceeds ANON_OUTPUT_CHAR_LIMIT.
export function checkMeter(req: Request, res: Response): boolean {
  if (isAuthed(req)) return true;
  const used = req.session?.aiOutputChars ?? 0;
  if (used >= ANON_OUTPUT_CHAR_LIMIT) {
    res.status(401).json({
      error: "login_required",
      message: "Sign in with Google to continue using the course.",
    });
    return false;
  }
  return true;
}

// Record AI-generated output against the anonymous session's meter. No-op for
// authenticated users. Accepts one or more strings so callers can total up all
// the generated text an endpoint produced.
export function recordAiOutput(req: Request, ...texts: (string | null | undefined)[]): void {
  if (isAuthed(req)) return;
  if (!req.session) return;
  const added = texts.reduce((sum, t) => sum + (t ? t.length : 0), 0);
  if (added <= 0) return;
  req.session.aiOutputChars = (req.session.aiOutputChars ?? 0) + added;
}

// Record one visit per browser session. Runs on every request but inserts a
// row only the first time a session is seen (flag stored on the session).
// Captures the session id always, plus the user id/email when signed in.
export const trackVisit: RequestHandler = (req, _res, next) => {
  if (req.session && !req.session.visitRecorded) {
    req.session.visitRecorded = true;
    const authed = isAuthed(req);
    const userId = authed ? (req.user?.id ?? null) : null;
    const email = authed ? (req.user?.email ?? null) : null;
    storage
      .recordVisit(userId, email, req.sessionID)
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
