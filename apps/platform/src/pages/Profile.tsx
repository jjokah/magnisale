import {
  fieldsInSection,
  FIELDS,
  isEmptyValue,
  SECTIONS,
  type FieldDef,
  type SectionData,
  type SectionId,
  type StoredField,
} from "@magnisale/profile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { draftToPayload, FieldEditor, initialDraft, type Draft } from "../components/FieldEditor";
import { FieldValueView, sourceText } from "../components/FieldValueView";
import { Button, ErrorNote } from "../components/Form";
import { api, errorMessage } from "../lib/api";

interface ProfileView {
  schemaVersion: number;
  sections: Record<SectionId, SectionData>;
  updatedAt: string | null;
}

const PROFILE_KEY = ["profile"] as const;

function EditForm({ def, stored, onClose }: { def: FieldDef; stored?: StoredField; onClose: () => void }) {
  const [draft, setDraft] = useState<Draft>(() => initialDraft(def, stored));
  const inputId = useId();
  const helpId = `${inputId}-help`;
  const queryClient = useQueryClient();
  const save = useMutation({
    mutationFn: () => api.patch("/profile/fields", { path: def.path, value: draftToPayload(def, draft) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
      onClose();
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    save.mutate();
  }

  const grouped = def.kind === "location" || def.kind === "links" || def.kind === "collection";
  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      {grouped ? (
        <p className="text-small font-semibold">{def.label}</p>
      ) : (
        <label htmlFor={inputId} className="text-small font-semibold">
          {def.label}
        </label>
      )}
      <FieldEditor def={def} draft={draft} onChange={setDraft} inputId={inputId} helpId={def.help ? helpId : undefined} />
      {def.help && (
        <p id={helpId} className="text-caption text-fg-muted">
          {def.help}
        </p>
      )}
      {save.isError && <ErrorNote message={errorMessage(save.error)} />}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save"}
        </Button>
        <Button variant="secondary" size="sm" onClick={onClose} disabled={save.isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

/** An empty field shows its question where the source line would be. */
function RowHeader({ def, stored, action }: { def: FieldDef; stored?: StoredField; action: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-small font-semibold">{def.label}</h3>
        <p className={stored ? "text-caption text-fg-muted" : "text-small text-fg-muted"}>
          {stored ? sourceText(stored.source) : def.hint}
        </p>
      </div>
      {action}
    </div>
  );
}

function FieldRow({
  def,
  stored,
  editing,
  locked,
  onEdit,
  onClose,
}: {
  def: FieldDef;
  stored?: StoredField;
  editing: boolean;
  locked: boolean;
  onEdit: () => void;
  onClose: () => void;
}) {
  const filled = stored && !isEmptyValue(stored.value);
  if (editing) {
    return (
      <div className="bg-action-tint p-4 sm:px-6">
        <EditForm def={def} stored={stored} onClose={onClose} />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 p-4 sm:px-6">
      <RowHeader
        def={def}
        stored={stored}
        action={
          <button
            type="button"
            onClick={onEdit}
            disabled={locked}
            aria-label={`${filled ? "Edit" : "Add"} ${def.label.toLowerCase()}`}
            className="flex min-h-11 flex-none items-center gap-2 rounded-md px-3 text-small font-semibold text-action transition-colors hover:bg-action-tint disabled:text-ink-300 disabled:hover:bg-transparent"
          >
            <Pencil size={16} strokeWidth={1.75} aria-hidden="true" />
            {filled ? "Edit" : "Add"}
          </button>
        }
      />
      {filled && <FieldValueView def={def} stored={stored} />}
    </div>
  );
}

function LogoRow({ def, stored }: { def: FieldDef; stored?: StoredField }) {
  const input = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: PROFILE_KEY });
  const upload = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append("file", file);
      return api.post("/org/logo", form);
    },
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: () => api.delete("/org/logo"), onSuccess: refresh });

  function chosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) upload.mutate(file);
    event.target.value = "";
  }

  const version = (stored?.value as { updatedAt?: string } | undefined)?.updatedAt;
  const failure = upload.error ?? remove.error;
  return (
    <div className="flex flex-col gap-2 p-4 sm:px-6">
      <RowHeader
        def={def}
        stored={stored}
        action={
          <div className="flex flex-none gap-1">
            {stored && (
              <button
                type="button"
                onClick={() => remove.mutate()}
                disabled={remove.isPending}
                className="flex min-h-11 items-center rounded-md px-3 text-small font-semibold text-danger hover:bg-danger-tint"
              >
                Remove
              </button>
            )}
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={upload.isPending}
              className="flex min-h-11 items-center gap-2 rounded-md px-3 text-small font-semibold text-action hover:bg-action-tint"
            >
              <Pencil size={16} strokeWidth={1.75} aria-hidden="true" />
              {upload.isPending ? "Uploading…" : stored ? "Replace" : "Upload"}
            </button>
          </div>
        }
      />
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" aria-label="Upload your logo" onChange={chosen} />
      {stored && (
        <img
          src={`/api/v1/org/logo?v=${encodeURIComponent(version ?? "")}`}
          alt="Your logo"
          className="h-16 w-fit max-w-48 rounded-sm border border-line object-contain p-1"
        />
      )}
      {failure && <ErrorNote message={errorMessage(failure)} />}
    </div>
  );
}

export function Profile() {
  const profile = useQuery({ queryKey: PROFILE_KEY, queryFn: () => api.get<ProfileView>("/profile") });
  const [editing, setEditing] = useState<string | null>(null);

  if (profile.isPending) {
    return (
      <p role="status" className="text-fg-muted">
        Loading your profile…
      </p>
    );
  }
  if (profile.isError) return <ErrorNote message={errorMessage(profile.error)} />;

  const { sections } = profile.data;
  const filled = FIELDS.filter((f) => !isEmptyValue(sections[f.section][f.key]?.value)).length;
  const brand = sections.identity.brandName?.value as string | undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <nav aria-label="Profile sections" className="hidden lg:block">
        <ul className="sticky top-24 flex flex-col gap-1">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="flex min-h-10 items-center rounded-md px-3 text-ui font-medium text-fg-muted transition-colors hover:bg-surface hover:text-fg">
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex min-w-0 flex-col gap-6">
        <header>
          <p className="t-eyebrow text-action">Company profile</p>
          <h1 className="t-h1 mt-2">{brand ?? "Your business"}</h1>
          <p className="mt-2 text-fg-muted">
            {filled} of {FIELDS.length} fields filled in.
          </p>
        </header>

        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-24 overflow-hidden rounded-lg border border-line bg-surface shadow-sm">
            <div className="border-b border-line px-4 py-4 sm:px-6">
              <h2 id={`${section.id}-title`} className="t-h4">
                {section.label}
              </h2>
              <p className="text-small text-fg-muted">{section.description}</p>
            </div>
            <div className="divide-y divide-line">
              {fieldsInSection(section.id).map((def) => {
                const stored = sections[def.section][def.key];
                if (def.kind === "image") return <LogoRow key={def.path} def={def} stored={stored} />;
                return (
                  <FieldRow
                    key={def.path}
                    def={def}
                    stored={stored}
                    editing={editing === def.path}
                    locked={editing !== null}
                    onEdit={() => setEditing(def.path)}
                    onClose={() => setEditing(null)}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
