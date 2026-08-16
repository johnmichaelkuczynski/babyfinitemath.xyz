import app from "./app";
import { pool } from "@workspace/db";
import { logger } from "./lib/logger";
import { seedIfEmpty, seedReasoningPrimersIfMissing } from "./lib/seed";
import { seedDiagnosticsIfEmpty } from "./lib/seedDiagnostics";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Idempotent schema self-heal: visit tracking needs visits.session_id, which
// may be missing on databases created before the column was added (the
// publish flow does not always run a full schema push).
async function ensureVisitSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS visits (
      id serial PRIMARY KEY,
      user_id integer,
      email text,
      session_id text,
      visited_at timestamptz DEFAULT now() NOT NULL
    );
  `);
  await pool.query(
    `ALTER TABLE visits ADD COLUMN IF NOT EXISTS session_id text;`,
  );
}

ensureVisitSchema()
  .catch((err) => {
    logger.error({ err }, "Visit schema self-heal failed");
  })
  .then(() => seedIfEmpty())
  .then(() => seedReasoningPrimersIfMissing())
  .then(() => seedDiagnosticsIfEmpty())
  .catch((err) => {
    logger.error({ err }, "Seed failed");
  });

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
