import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type { ZodType } from "zod";

/** Validates a request part and answers 422 with the first message in plain words. */
export const validate = <Target extends keyof ValidationTargets, Schema extends ZodType>(target: Target, schema: Schema) =>
  zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json({ detail: result.error.issues[0]?.message ?? "That is not valid." }, 422);
    }
  });
