import bcrypt from "bcryptjs";

// Cost 12 in production; lowered under test so suites are not dominated by key
// stretching. Verification is unaffected: the cost is encoded in the hash.
const BCRYPT_ROUNDS = process.env.NODE_ENV === "test" ? 4 : 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

let dummyHash: Promise<string> | undefined;

/**
 * A real hash at the configured cost, compared against when no account matches
 * so that a miss costs the same as a wrong password. It has to be a well-formed
 * hash: bcryptjs rejects anything else instantly, which would make "no such
 * account" measurably faster.
 */
export function dummyPasswordHash(): Promise<string> {
  dummyHash ??= hashPassword(globalThis.crypto.randomUUID());
  return dummyHash;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

/** Account emails are compared case-insensitively and stored lower-case. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
