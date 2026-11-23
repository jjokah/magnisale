import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button, ErrorNote, SuccessNote, TextField } from "../components/Form";
import { api, errorMessage } from "../lib/api";
import { ME_KEY, useMe } from "../lib/auth";

function Panel({ title, lede, children }: { title: string; lede: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-line bg-surface p-6 shadow-sm">
      <h2 className="t-h4">{title}</h2>
      <p className="mt-1 mb-4 text-small text-fg-muted">{lede}</p>
      {children}
    </section>
  );
}

function RenameForm({ current }: { current: string }) {
  const [name, setName] = useState(current);
  const queryClient = useQueryClient();
  const rename = useMutation({
    mutationFn: () => api.patch("/org", { name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ME_KEY }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    rename.mutate();
  }

  return (
    <form onSubmit={submit} className="flex max-w-md flex-col gap-3">
      {rename.isError && <ErrorNote message={errorMessage(rename.error)} />}
      {rename.isSuccess && <SuccessNote>Saved.</SuccessNote>}
      <TextField
        label="Organisation name"
        required
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          rename.reset();
        }}
      />
      <div>
        <Button type="submit" size="sm" disabled={rename.isPending || name.trim() === current}>
          {rename.isPending ? "Saving…" : "Save name"}
        </Button>
      </div>
    </form>
  );
}

function DeleteOrganisation({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const remove = useMutation({
    mutationFn: () => api.delete("/org", { confirmName: typed }),
    onSuccess: () => {
      queryClient.clear();
      navigate("/sign-up", { replace: true });
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    remove.mutate();
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setTyped("");
        remove.reset();
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant="secondary" size="sm" className="!text-danger">
          Delete organisation
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink-900/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-surface p-6 shadow-lg">
          <Dialog.Title className="t-h4">Delete {name}?</Dialog.Title>
          <Dialog.Description className="mt-2 text-small text-fg-muted">
            This removes the organisation, its whole profile and your account. It cannot be undone.
          </Dialog.Description>
          <form onSubmit={submit} className="mt-4 flex flex-col gap-4">
            {remove.isError && <ErrorNote message={errorMessage(remove.error)} />}
            <TextField label={`Type ${name} to confirm`} autoComplete="off" required value={typed} onChange={(e) => setTyped(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="secondary" size="sm">
                  Keep it
                </Button>
              </Dialog.Close>
              <Button type="submit" variant="danger" size="sm" disabled={remove.isPending || typed.trim() !== name}>
                {remove.isPending ? "Deleting…" : "Delete everything"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Settings() {
  const me = useMe();
  const organization = me.data?.organization;
  if (!organization) return null;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <p className="t-eyebrow text-action">Settings</p>
        <h1 className="t-h1 mt-2">{organization.name}</h1>
        <p className="mt-2 text-fg-muted">Signed in as {me.data?.user.email}.</p>
      </header>

      <Panel title="Organisation" lede="The name shown across the app.">
        <RenameForm key={organization.name} current={organization.name} />
      </Panel>

      <Panel title="Your data" lede="Your profile belongs to you. Download everything we hold about your organisation at any time.">
        <a href="/api/v1/org/export.json" download className="btn btn-secondary btn-sm">
          <Download size={18} strokeWidth={1.75} aria-hidden="true" />
          Download my data
        </a>
      </Panel>

      <Panel title="Delete organisation" lede="Removes the organisation, its profile and your account.">
        <DeleteOrganisation name={organization.name} />
      </Panel>
    </div>
  );
}
