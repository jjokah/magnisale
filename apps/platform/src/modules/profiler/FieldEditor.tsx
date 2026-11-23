import type {
  CollectionFieldDef,
  CollectionItem,
  FieldDef,
  ItemFieldDef,
  LinkValue,
  LocationValue,
  StoredField,
} from "@magnisale/profiler";
import { Plus, X } from "lucide-react";
import { useId, useState, type KeyboardEvent } from "react";
import { Button } from "@magnisale/ui";

type ItemDraft = { key: string; id?: string; values: Record<string, string | string[]> };
export type Draft = string | string[] | LocationValue | LinkValue[] | ItemDraft[];

let nextKey = 0;
const localKey = () => `new-${nextKey++}`;

export function initialDraft(def: FieldDef, stored?: StoredField): Draft {
  const value = stored?.value;
  switch (def.kind) {
    case "tags":
      return (value as string[] | undefined) ?? [];
    case "location":
      return (value as LocationValue | undefined) ?? {};
    case "links":
      return (value as LinkValue[] | undefined) ?? [{ label: "", url: "" }];
    case "collection": {
      const items = (value as CollectionItem[] | undefined) ?? [];
      return items.length > 0
        ? items.map((item) => ({ key: item.id, id: item.id, values: item.values }))
        : [{ key: localKey(), values: {} }];
    }
    default:
      return value === undefined ? "" : String(value);
  }
}

const isBlank = (v: string | string[] | undefined) =>
  v === undefined || (Array.isArray(v) ? v.length === 0 : v.trim() === "");

/** What the API expects. Rows left entirely blank are dropped rather than refused. */
export function draftToPayload(def: FieldDef, draft: Draft): unknown {
  switch (def.kind) {
    case "tags":
    case "location":
      return draft;
    case "links":
      return (draft as LinkValue[]).filter((l) => l.label.trim() || l.url.trim());
    case "collection":
      return (draft as ItemDraft[])
        .filter((item) => Object.values(item.values).some((v) => !isBlank(v)))
        .map(({ id, values }) => (id ? { id, values } : { values }));
    default: {
      const text = (draft as string).trim();
      return text === "" ? null : text;
    }
  }
}

/** Chips with a text box. Enter or a comma adds; leaving the box adds what is left in it. */
function TagInput({
  id,
  value,
  onChange,
  describedBy,
}: {
  id?: string;
  value: string[];
  onChange: (next: string[]) => void;
  describedBy?: string;
}) {
  const [text, setText] = useState("");

  function commit() {
    const added = text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (added.length > 0) {
      const known = new Set(value.map((v) => v.toLowerCase()));
      onChange([...value, ...added.filter((t) => !known.has(t.toLowerCase()))]);
    }
    setText("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit();
    } else if (event.key === "Backspace" && text === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <li key={tag} className="chip">
              <span>{tag}</span>
              <button
                type="button"
                aria-label={`Remove ${tag}`}
                onClick={() => onChange(value.filter((v) => v !== tag))}
                className="flex size-6 items-center justify-center rounded-pill hover:bg-ink-200"
              >
                <X size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        className="input"
        value={text}
        aria-describedby={describedBy}
        placeholder="Type, then press Enter"
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
      />
    </div>
  );
}

function LocationEditor({ value, onChange }: { value: LocationValue; onChange: (next: LocationValue) => void }) {
  const baseId = useId();
  const parts = [
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "country", label: "Country" },
  ] as const;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {parts.map((part) => (
        <div key={part.key} className="field">
          <label htmlFor={`${baseId}-${part.key}`}>{part.label}</label>
          <input
            id={`${baseId}-${part.key}`}
            className="input"
            value={value[part.key] ?? ""}
            onChange={(event) => onChange({ ...value, [part.key]: event.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

function LinksEditor({ value, onChange }: { value: LinkValue[]; onChange: (next: LinkValue[]) => void }) {
  const baseId = useId();
  const update = (index: number, patch: Partial<LinkValue>) =>
    onChange(value.map((link, i) => (i === index ? { ...link, ...patch } : link)));
  return (
    <div className="flex flex-col gap-3">
      {value.map((link, index) => (
        <div key={index} className="flex items-end gap-2">
          <div className="field w-32 flex-none sm:w-40">
            <label htmlFor={`${baseId}-l${index}`}>Name</label>
            <input
              id={`${baseId}-l${index}`}
              className="input"
              placeholder="LinkedIn"
              value={link.label}
              onChange={(event) => update(index, { label: event.target.value })}
            />
          </div>
          <div className="field min-w-0 flex-1">
            <label htmlFor={`${baseId}-u${index}`}>Address</label>
            <input
              id={`${baseId}-u${index}`}
              className="input"
              inputMode="url"
              value={link.url}
              onChange={(event) => update(index, { url: event.target.value })}
            />
          </div>
          <button
            type="button"
            aria-label={`Remove link ${index + 1}`}
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            className="flex size-12 flex-none items-center justify-center rounded-md text-fg-muted hover:bg-surface-subtle hover:text-fg"
          >
            <X size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      ))}
      <div>
        <Button variant="secondary" size="sm" onClick={() => onChange([...value, { label: "", url: "" }])}>
          <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
          Add a link
        </Button>
      </div>
    </div>
  );
}

function ItemFieldInput({
  field,
  value,
  onChange,
}: {
  field: ItemFieldDef;
  value: string | string[] | undefined;
  onChange: (next: string | string[]) => void;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const describedBy = field.help ? helpId : undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{field.label}</label>
      {field.kind === "tags" ? (
        <TagInput id={id} value={(value as string[]) ?? []} onChange={onChange} describedBy={describedBy} />
      ) : field.kind === "longtext" ? (
        <textarea
          id={id}
          className="input"
          aria-describedby={describedBy}
          value={(value as string) ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          className="input"
          aria-describedby={describedBy}
          value={(value as string) ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {field.help && (
        <p id={helpId} className="text-caption text-fg-muted">
          {field.help}
        </p>
      )}
    </div>
  );
}

function CollectionEditor({
  def,
  value,
  onChange,
}: {
  def: CollectionFieldDef;
  value: ItemDraft[];
  onChange: (next: ItemDraft[]) => void;
}) {
  const update = (key: string, fieldKey: string, next: string | string[]) =>
    onChange(
      value.map((item) => (item.key === key ? { ...item, values: { ...item.values, [fieldKey]: next } } : item)),
    );

  return (
    <div className="flex flex-col gap-4">
      {value.map((item, index) => (
        <div
          key={item.key}
          className="flex flex-col gap-4 rounded-md border border-line bg-surface-subtle p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-small font-semibold">
              {def.itemLabel[0]!.toUpperCase() + def.itemLabel.slice(1)} {index + 1}
            </p>
            <button
              type="button"
              onClick={() => onChange(value.filter((i) => i.key !== item.key))}
              className="flex min-h-11 items-center gap-1 rounded-md px-2 text-small font-semibold text-danger hover:bg-danger-tint"
            >
              Remove
            </button>
          </div>
          {def.itemFields.map((field) => (
            <ItemFieldInput
              key={field.key}
              field={field}
              value={item.values[field.key]}
              onChange={(next) => update(item.key, field.key, next)}
            />
          ))}
        </div>
      ))}
      <div>
        <Button variant="secondary" size="sm" onClick={() => onChange([...value, { key: localKey(), values: {} }])}>
          <Plus size={18} strokeWidth={1.75} aria-hidden="true" />
          Add a {def.itemLabel}
        </Button>
      </div>
    </div>
  );
}

const INPUT_TYPES: Partial<Record<FieldDef["kind"], { type: string; inputMode?: "numeric" | "url" | "email" | "tel" }>> = {
  year: { type: "text", inputMode: "numeric" },
  url: { type: "text", inputMode: "url" },
  email: { type: "email", inputMode: "email" },
  phone: { type: "tel", inputMode: "tel" },
};

/** The input for one field. Field kinds with several inputs label each one themselves. */
export function FieldEditor({
  def,
  draft,
  onChange,
  inputId,
  helpId,
}: {
  def: FieldDef;
  draft: Draft;
  onChange: (next: Draft) => void;
  inputId: string;
  helpId?: string;
}) {
  switch (def.kind) {
    case "tags":
      return <TagInput id={inputId} value={draft as string[]} onChange={onChange} describedBy={helpId} />;
    case "location":
      return <LocationEditor value={draft as LocationValue} onChange={onChange} />;
    case "links":
      return <LinksEditor value={draft as LinkValue[]} onChange={onChange} />;
    case "collection":
      return <CollectionEditor def={def} value={draft as ItemDraft[]} onChange={onChange} />;
    case "longtext":
      return (
        <textarea
          id={inputId}
          className="input"
          autoFocus
          aria-describedby={helpId}
          value={draft as string}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    default:
      return (
        <input
          id={inputId}
          className="input"
          autoFocus
          aria-describedby={helpId}
          {...INPUT_TYPES[def.kind]}
          value={draft as string}
          onChange={(event) => onChange(event.target.value)}
        />
      );
  }
}
