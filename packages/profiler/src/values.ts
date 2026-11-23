import { z } from "zod";
import type { CollectionFieldDef, FieldDef, ItemFieldDef, Source } from "./fields.js";

export interface LocationValue {
  country?: string;
  state?: string;
  city?: string;
}

export interface LinkValue {
  label: string;
  url: string;
}

export interface ImageValue {
  /** Which stored asset this points at. Set by the server, never by a client. */
  asset: "logo";
  updatedAt: string;
}

export type ItemValues = Record<string, string | string[]>;

export interface CollectionItem {
  id: string;
  values: ItemValues;
  source: Source;
}

export type FieldValue =
  | string
  | number
  | string[]
  | LocationValue
  | LinkValue[]
  | ImageValue
  | CollectionItem[];

export interface StoredField<T extends FieldValue = FieldValue> {
  value: T;
  source: Source;
}

/** One section of a saved profile, keyed by field key. A missing key is an empty field. */
export type SectionData = Record<string, StoredField>;

/** What a client sends for one collection entry. Entries without an id are new. */
export interface CollectionItemInput {
  id?: string;
  values: ItemValues;
}

const text = (max: number) => z.string().trim().min(1, "This cannot be empty.").max(max, `Keep this under ${max} characters.`);

function dedupe(list: string[]): string[] {
  const seen = new Set<string>();
  return list.filter((entry) => {
    const key = entry.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const tags = z
  .array(z.string().trim().max(200, "Keep each entry under 200 characters."))
  .max(40, "Keep this to 40 entries or fewer.")
  .transform((list) => dedupe(list.filter(Boolean)));

/** Accepts "magnisale.com". Only http and https survive, because these become links. */
function withScheme(value: string): string {
  return /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
}

function isWebAddress(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

const webAddress = z
  .string()
  .trim()
  .min(1, "Enter a web address.")
  .max(2048, "That address is too long.")
  .transform(withScheme)
  .refine(isWebAddress, "Enter a full web address, such as magnisale.com.");

const optionalPart = z
  .string()
  .trim()
  .max(120, "Keep this under 120 characters.")
  .optional()
  .transform((v) => v || undefined);

const location = z
  .object({ country: optionalPart, state: optionalPart, city: optionalPart })
  .transform((v) => {
    const out: LocationValue = {};
    if (v.country) out.country = v.country;
    if (v.state) out.state = v.state;
    if (v.city) out.city = v.city;
    return out;
  });

const links = z
  .array(z.object({ label: text(60), url: webAddress }))
  .max(20, "Keep this to 20 links or fewer.");

const year = z.coerce
  .number("Enter a year.")
  .int("Enter a whole year, such as 2019.")
  .min(1800, "Enter a year from 1800 onwards.")
  .refine((y) => y <= new Date().getUTCFullYear(), "That year is in the future.");

const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address."));

const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9 ()-]{5,23}$/, "Enter a phone number, such as +234 801 234 5678.");

function itemValueSchema(field: ItemFieldDef): z.ZodType<string | string[] | undefined> {
  if (field.kind === "tags") {
    return tags.optional().transform((v) => (v && v.length > 0 ? v : undefined));
  }
  const max = field.kind === "longtext" ? 4000 : 300;
  return z
    .string()
    .trim()
    .max(max, `Keep ${field.label.toLowerCase()} under ${max} characters.`)
    .optional()
    .transform((v) => v || undefined);
}

function parseCollection(def: CollectionFieldDef, input: unknown): ParseResult<CollectionItemInput[]> {
  if (!Array.isArray(input)) return { ok: false, message: "Expected a list." };
  if (input.length > 50) return { ok: false, message: "Keep this to 50 entries or fewer." };

  const out: CollectionItemInput[] = [];
  for (const raw of input) {
    const shape = z.object({ id: z.string().max(64).optional(), values: z.record(z.string(), z.unknown()) }).safeParse(raw);
    if (!shape.success) return { ok: false, message: "That entry is not valid." };

    const values: ItemValues = {};
    for (const field of def.itemFields) {
      const parsed = itemValueSchema(field).safeParse(shape.data.values[field.key]);
      if (!parsed.success) return { ok: false, message: firstMessage(parsed.error) };
      if (parsed.data !== undefined) values[field.key] = parsed.data;
    }
    if (!values[def.titleField]) {
      const title = def.itemFields.find((f) => f.key === def.titleField)!;
      return { ok: false, message: `Each ${def.itemLabel} needs a ${title.label.toLowerCase()}.` };
    }
    out.push(shape.data.id ? { id: shape.data.id, values } : { values });
  }
  return { ok: true, value: out };
}

function firstMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? "That value is not valid.";
}

export type ParseResult<T> = { ok: true; value: T } | { ok: false; message: string };

/**
 * Validates a value for a field and returns it in stored form. `null` clears
 * the field. Collections come back as inputs: `applyFieldValue` turns them
 * into stored items, keeping the id and source of entries that did not change.
 */
export function parseFieldValue(
  def: FieldDef,
  input: unknown,
): ParseResult<Exclude<FieldValue, CollectionItem[] | ImageValue> | CollectionItemInput[] | null> {
  if (input === null) return { ok: true, value: null };
  if (def.kind === "collection") return parseCollection(def, input);
  if (def.kind === "image") {
    return { ok: false, message: "Upload a logo instead of typing a value." };
  }

  const schema = {
    text: text(300),
    longtext: text(4000),
    tags,
    year,
    url: webAddress,
    email,
    phone,
    location,
    links,
  }[def.kind];

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, message: firstMessage(parsed.error) };
  return { ok: true, value: parsed.data as Exclude<FieldValue, CollectionItem[] | ImageValue> };
}

export function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

/** Deep equality that ignores key order, because jsonb does not preserve it. */
export function sameValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((entry, i) => sameValue(entry, b[i]));
  }
  if (typeof a === "object" && typeof b === "object" && a !== null && b !== null) {
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    const keys = Object.keys(left);
    if (keys.length !== Object.keys(right).length) return false;
    return keys.every((key) => key in right && sameValue(left[key], right[key]));
  }
  return false;
}

/**
 * Returns the section with one field changed. An unchanged value keeps its
 * original source, so saving without editing never claims the owner typed
 * something that came from the website.
 */
export function applyFieldValue(
  section: SectionData,
  def: FieldDef,
  value: Exclude<FieldValue, CollectionItem[]> | CollectionItemInput[] | null,
  source: Source,
  newId: () => string,
): SectionData {
  const next = { ...section };

  if (value === null || isEmptyValue(value)) {
    delete next[def.key];
    return next;
  }

  const current = section[def.key];

  if (def.kind === "collection") {
    const existing = (current?.value ?? []) as CollectionItem[];
    const byId = new Map(existing.map((item) => [item.id, item]));
    const items = (value as CollectionItemInput[]).map((input): CollectionItem => {
      const match = input.id ? byId.get(input.id) : undefined;
      if (match && sameValue(match.values, input.values)) return match;
      return { id: match?.id ?? newId(), values: input.values, source };
    });
    if (current && sameValue(existing, items)) return next;
    next[def.key] = { value: items, source };
    return next;
  }

  if (current && sameValue(current.value, value)) return next;
  next[def.key] = { value: value as FieldValue, source };
  return next;
}
