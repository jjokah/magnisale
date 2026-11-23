import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AuthLayout, GoogleButton } from "../components/AuthLayout";
import { Button, ErrorNote, SuccessNote, TextField } from "../components/Form";
import { api, errorMessage } from "../lib/api";
import { ME_KEY } from "../lib/auth";

export function SignIn() {
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const queryClient = useQueryClient();
  const signIn = useMutation({
    mutationFn: () => api.post("/auth/sign-in", { email, password }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ME_KEY }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    signIn.mutate();
  }

  return (
    <AuthLayout title="Sign in" lede="Pick up where you left off with your company profile.">
      <GoogleButton label="Continue with Google" />
      <form onSubmit={submit} className="flex flex-col gap-4">
        {params.get("reset") === "1" && <SuccessNote>Your password is changed. Sign in with the new one.</SuccessNote>}
        {params.get("error") === "google" && <ErrorNote message="Google sign-in did not work. Please try again." />}
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
