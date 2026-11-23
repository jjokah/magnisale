import { lt } from "drizzle-orm";
import { sessions, verifications, type Db } from "@magnisale/db";

/** Deletes sessions and verification tokens that can no longer be used. */
export async function sweepExpiredAuth(db: Db, now = new Date()) {
  const expiredSessions = await db.delete(sessions).where(lt(sessions.expiresAt, now)).returning({ id: sessions.id });
  const expiredTokens = await db
    .delete(verifications)
    .where(lt(verifications.expiresAt, now))
    .returning({ id: verifications.id });
  return { sessions: expiredSessions.length, verifications: expiredTokens.length };
}
