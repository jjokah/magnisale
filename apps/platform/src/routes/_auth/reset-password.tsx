import { Button, ErrorNote, TextField } from "@magnisale/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthLayout } from "../../components/AuthLayout";
import { errorMessage } from "../../lib/api";
import { authCall, authClient } from "../../lib/auth";
import { ME_KEY } from "../../lib/query";

export const Route = createFileRoute("/_auth/reset-password")({ component: ResetPassword });

function ResetPassword() {
  // Read raw: the router parses search values as JSON, which could turn an
  // all-digit token into a number.
  const [token] = useState(() => new URLSearchParams(window.location.search).get("token") ?? "");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const reset = useMutation({
    mutationFn: () => authCall(authClient.resetPassword({ token, newPassword: password })),
    onSuccess: async () => {
      // A reset ends every session, this browser's included.
      queryClient.setQueryData(ME_KEY, null);
      await navigate({ to: "/sign-in", search: { reset: true }, replace: true });
    },
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    reset.mutate();
  }

  return (
    <AuthLayout title="Choose a new password">
      {token ? (
        <form onSubmit={submit} className="flex flex-col gap-4">
          {reset.isError && <ErrorNote message={errorMessage(reset.error)} />}
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            help="At least 10 characters."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" disabled={reset.isPending} className="w-full">
            {reset.isPending ? "Saving…" : "Save new password"}
          </Button>
        </form>
      ) : (
        <ErrorNote message="This link is not complete. Ask for a new one." />
      )}
      <p className="mt-5 text-small">
        <Link to="/forgot-password" className="font-semibold text-action">
          Ask for a new link
        </Link>
      </p>
    </AuthLayout>
  );
}
