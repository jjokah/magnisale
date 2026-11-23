import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useMeta } from "../lib/auth";
import { Logo } from "./Logo";

export function AuthLayout({ title, lede, children }: { title: string; lede?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-subtle">
      <header className="wrap flex h-16 items-center">
        <Logo to="/" />
      </header>
      <main className="flex flex-1 justify-center px-4 pt-4 pb-16 sm:pt-10">
        <div className="w-full max-w-[28rem]">
          <h1 className="t-h2">{title}</h1>
          {lede && <p className="mt-2 text-fg-muted">{lede}</p>}
          <div className="card mt-6 p-6 hover:!border-line hover:!shadow-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}

/** Shown only when Google sign-in is configured. A full page load, not a route. */
export function GoogleButton({ label }: { label: string }) {
  const meta = useMeta();
  if (!meta.data?.google) return null;
  return (
    <>
      <a href="/api/v1/auth/google/start" className="btn btn-secondary w-full">
        {label}
      </a>
      <div className="my-5 flex items-center gap-3 text-caption text-fg-muted">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>
    </>
  );
}

export function ConsentCheckbox({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-start gap-3 text-small">
      <input
        type="checkbox"
        required
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-5 flex-none accent-action"
      />
      <span>
        I agree to Magnisale storing my company information as set out in the{" "}
        <Link to="/privacy" target="_blank" className="font-semibold text-action underline underline-offset-4">
          privacy notice
        </Link>
        .
      </span>
    </label>
  );
}
