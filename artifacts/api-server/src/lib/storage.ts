import { eq, desc, gte, sql } from "drizzle-orm";
import { db, usersTable, visitsTable } from "@workspace/db";

type User = typeof usersTable.$inferSelect;
type Visit = typeof visitsTable.$inferSelect;

export const storage = {
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    return user;
  },

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.googleId, googleId));
    return user;
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    return user;
  },

  async createUserWithGoogle(data: {
    username: string;
    googleId: string;
    email: string | null;
    displayName: string | null;
  }): Promise<User> {
    const [user] = await db.insert(usersTable).values(data).returning();
    return user;
  },

  async updateUserGoogle(
    id: number,
    data: { googleId?: string | null; displayName?: string | null },
  ): Promise<User> {
    const [user] = await db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.id, id))
      .returning();
    return user;
  },

  async recordVisit(
    userId: number | null,
    email: string | null,
    sessionId?: string | null,
  ): Promise<void> {
    await db
      .insert(visitsTable)
      .values({ userId, email, sessionId: sessionId ?? null });
  },

  // Unique visitors are counted by a stable identity: the signed-in email when
  // available, otherwise the anonymous session id. Total visits is every row.
  async getVisitorStats(): Promise<{
    uniqueVisitors: number;
    totalVisits: number;
  }> {
    const result = await db.execute(
      sql`select
            count(*)::int as total_visits,
            count(distinct coalesce(email, session_id))::int as unique_visitors
          from visits`,
    );
    const row = result.rows[0] as
      | { total_visits?: number; unique_visitors?: number }
      | undefined;
    return {
      uniqueVisitors: row?.unique_visitors ?? 0,
      totalVisits: row?.total_visits ?? 0,
    };
  },

  async getVisits(limit: number): Promise<Visit[]> {
    return db
      .select()
      .from(visitsTable)
      .orderBy(desc(visitsTable.visitedAt))
      .limit(limit);
  },

  async getVisitTimestampsSince(since: Date | null): Promise<string[]> {
    const rows = since
      ? await db
          .select({ visitedAt: visitsTable.visitedAt })
          .from(visitsTable)
          .where(gte(visitsTable.visitedAt, since))
      : await db.select({ visitedAt: visitsTable.visitedAt }).from(visitsTable);
    return rows.map((r) => r.visitedAt.toISOString());
  },
};
