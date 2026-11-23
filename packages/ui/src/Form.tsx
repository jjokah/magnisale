import { useId, type ComponentProps, type ReactNode } from "react";

export function ErrorNote({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-md bg-danger-tint px-4 py-3 text-small font-medium text-danger">
      {message}
    </p>
  );
}

export function SuccessNote({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="rounded-md bg-success-tint px-4 py-3 text-small font-medium text-success">
      {children}
    </p>
  );
}

export function TextField({ label, help, ...input }: ComponentProps<"input"> & { label: string; help?: string }) {
  const id = useId();
  const helpId = `${id}-help`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} className="input" aria-describedby={help ? helpId : undefined} {...input} />
      {help && (
        <p id={helpId} className="text-caption text-fg-muted">
          {help}
        </p>
      )}
    </div>
  );
}
