import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button, ErrorNote, SuccessNote, TextField } from "../components/Form";
import { api, errorMessage } from "../lib/api";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const send = useMutation({ mutationFn: () => api.post("/auth/forgot-password", { email }) });

  function submit(event: FormEvent) {
    event.preventDefault();
    send.mutate();
  }

  return (
    <AuthLayout title="Reset your password" lede="We will email you a link to choose a new one.">
      {send.isSuccess ? (
        <SuccessNote>If that email has an account, the link is on its way. It works for one hour.</SuccessNote>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          {send.isError && <ErrorNote message={errorMessage(send.error)} />}
          <TextField label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" disabled={send.isPending} className="w-full">
            {send.isPending ? "Sending…" : "Send the link"}
          </Button>
        </form>
      )}
      <p className="mt-5 text-small">
        <Link to="/sign-in" className="font-semibold text-action">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
