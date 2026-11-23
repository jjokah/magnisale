import { getField, parseFieldValue } from "@magnisale/profile";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { orgIdOf, requireOrg } from "../auth/session.js";
import { ownerSource, readProfile, writeField } from "../profile/store.js";

const fieldEditSchema = z.object({ path: z.string(), value: z.unknown() });

export async function profileRoutes(app: FastifyInstance): Promise<void> {
  const { db } = app.ctx;

  app.get("/profile", { preHandler: requireOrg }, async (request) => readProfile(db, orgIdOf(request)));

  // An owner's inline edit of one field. `value: null` clears it.
  app.patch("/profile/fields", { preHandler: requireOrg }, async (request, reply) => {
    const { path, value } = fieldEditSchema.parse(request.body);
    const def = getField(path);
    if (!def) return reply.code(404).send({ detail: "No such field." });

    const parsed = parseFieldValue(def, value ?? null);
    if (!parsed.ok) return reply.code(422).send({ detail: parsed.message });

    const section = await writeField(db, orgIdOf(request), def, parsed.value, ownerSource());
    return { path, field: section[def.key] ?? null };
  });
}
