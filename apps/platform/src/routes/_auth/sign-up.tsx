import { Button, ErrorNote, TextField } from "@magnisale/ui";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthLayout, ConsentCheckbox, GoogleButton } from "../../components/AuthLayout";
import { errorMessage } from "../../lib/api";
import { authCall, authClient, refreshMe } from "../../lib/auth";

export const Route = createFileRoute("/_auth/sign-up")({ component: SignUp });

function SignUp() {
  const [form, setForm] = useState({ name: "", email: "", password: "", companyName: "" });
  const [consent, setConsent] = useState(false);
  const navigate = useNavigate();
  const signUp = useMutation({
    // companyName and consent are checked on the server, before the account is created.
    mutationFn: () => authCall(authClient.signUp.email({ ...form, consent } as Parameters<typeof authClient.signUp.email>[0])),
    onSuccess: async () => {
      await refreshMe();
      await navigate({ to: "/", replace: true });
    },
  });
  const set = (key: keyof typeof form) => (event: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: event.target.value }));

  function submit(event: FormEvent) {
    event.preventDefault();
    signUp.mutate();
  }

  return (
    <AuthLayout title="Create your company profile" lede="Put what you know about your business in one place.">
      <GoogleButton label="Sign up with Google" />
      <form onSubmit={submit} className="flex flex-col gap-4">
        {signUp.isError && <ErrorNote message={errorMessage(signUp.error)} />}
        <TextField label="Your name" autoComplete="name" required value={form.name} onChange={set("name")} />
        <TextField label="Company name" autoComplete="organization" required value={form.companyName} onChange={set("companyName")} />
        <TextField label="Work email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} />
        <TextField
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          help="At least 10 characters."
          value={form.password}
          onChange={set("password")}
        />
        <ConsentCheckbox checked={consent} onChange={setConsent} />
        <Button type="submit" disabled={signUp.isPending} className="w-full">
          {signUp.isPending ? "Creating your account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-5 text-small text-fg-muted">
        Already have an account?{" "}
        <Link to="/sign-in" className="font-semibold text-action">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
