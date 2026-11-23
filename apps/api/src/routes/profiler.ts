import { Hono } from "hono";
import { getField, parseFieldValue } from "@magnisale/profiler";
import { ownerSource, readProfile, writeField } from "@magnisale/profiler/server";
import { fieldEditSchema } from "@magnisale/validation";
import type { AppEnv } from "../context.js";
import { limitBody } from "../middleware/security.js";
import { companyIdOf, requireCompany } from "../middleware/session.js";
import { validate } from "../middleware/validate.js";

export const profilerRoutes = new Hono<AppEnv>()
  .get("/", requireCompany, async (c) => c.json(await readProfile(c.var.deps.db, companyIdOf(c))))

  // An owner's inline edit of one field. `value: null` clears it.
  .patch("/fields", requireCompany, limitBody(2 * 1024 * 1024), validate("json", fieldEditSchema), async (c) => {
    const { path, value } = c.req.valid("json");
    const def = getField(path);
    if (!def) return c.json({ detail: "No such field." }, 404);

    const parsed = parseFieldValue(def, value ?? null);
    if (!parsed.ok) return c.json({ detail: parsed.message }, 422);

    const section = await writeField(c.var.deps.db, companyIdOf(c), def, parsed.value, ownerSource());
    return c.json({ path, field: section[def.key] ?? null });
  });
