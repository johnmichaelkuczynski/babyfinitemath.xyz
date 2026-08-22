import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import type { Express, RequestHandler } from "express";
import pg from "pg";

/**
 * The course is fully public: there are no accounts, OAuth providers, login
 * routes, or user identity checks. We retain an anonymous browser session only
 * to keep a visitor's course progress and visit count together.
 */
export function setupSession(app: Express) {
  app.set("trust proxy", 1);

  const pool = new pg.Pool({
    connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  pool.on("error", (err) => console.error("Session pool error:", err));

  pool
    .query(`
      CREATE TABLE IF NOT EXISTS "user_sessions" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      );
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'session_pkey'
        ) THEN
          ALTER TABLE "user_sessions"
            ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
        END IF;
      END $$;
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "user_sessions" ("expire");
    `)
    .catch((err: unknown) => console.error("Session table ensure error:", err));

  const PgSession = connectPgSimple(session);
  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && !process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required in production");
  }

  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "user_sessions",
        createTableIfMissing: false,
        errorLog: console.error.bind(console, "Session store error:"),
      }),
      secret: process.env.SESSION_SECRET || "prompt-engineering-dev-session",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction || !!process.env.REPLIT_DEV_DOMAIN,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      },
    }),
  );
}

/**
 * Internal bulk-generation and reset tools are intentionally unavailable in
 * production now that the public course has no authenticated administrator.
 */
export const internalToolsOnly: RequestHandler = (_req, res, next) => {
  if (process.env.NODE_ENV !== "production") return next();
  res.status(404).json({ error: "Not found" });
};