import { Button, ErrorNote, SuccessNote, TextField } from "@magnisale/ui";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthLayout, GoogleButton } from "../../components/AuthLayout";
import { errorMessage } from "../../lib/api";
import { authCall, authClient, refreshMe } from "../../lib/auth";

export const Route = createFileRoute("/_auth/sign-in")({
  validateSearch: (search: Record<string, unknown>): { reset?: boolean; error?: string } => ({
    ...(search.reset === 1 || search.reset === "1" || search.reset === true ? { reset: true } : {}),
    ...(typeof search.error === "string" ? { error: search.error } : {}),
  }),
  component: SignIn,
});

function googleError(code: string): string {
  return code === "account_not_linked"
    ? "An account with this email already exists. Sign in with your password, or reset it below."
    : "Google sign-in did not work. Please try again.";
}

function SignIn() {
  const { reset, error } = Route.useSearch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const signIn = useMutation({
    mutationFn: () => authCall(authClient.signIn.email({ email, password })),
    onSuccess: async () => {
      await refreshMe();
      await navigate({ to: "/", replace: true });
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    signIn.mutate();
  }

  return (
    <AuthLayout title="Sign in" lede="Pick up where you left off with your company profile.">
      <GoogleButton label="Continue with Google" />
      <form onSubmit={submit} className="flex flex-col gap-4">
        {reset && <SuccessNote>Your password is changed. Sign in with the new one.</SuccessNote>}
        {error && <ErrorNote message={googleError(error)} />}
        {signIn.isError && <ErrorNote message={errorMessage(signIn.error)} />}
        <TextField label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <Button type="submit" disabled={signIn.isPending} className="w-full">
          {signIn.isPending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="mt-5 flex flex-wrap justify-between gap-2 text-small">
        <Link to="/forgot-password" className="font-semibold text-action">
          Forgot your password?
        </Link>
        <Link to="/sign-up" className="font-semibold text-action">
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
}
