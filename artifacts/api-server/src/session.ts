import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import type { Express } from "express";
import pg from "pg";
import { storage } from "./lib/storage";

/**
 * The course is fully public. Anonymous browser sessions are used only to
 * preserve a visitor's course progress and to count unique browser visits.
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

  // Without accounts, this course-wide metric is available to every visitor.
  app.get("/api/admin/visitors", async (_req, res) => {
    try {
      res.json(await storage.getVisitorStats());
    } catch (error) {
      console.error("Visitor stats error:", error);
      res.status(500).json({ error: "Failed to load visitor stats" });
    }
  });
}