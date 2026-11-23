import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { Button, ErrorNote, TextField } from "../components/Form";
import { api, errorMessage } from "../lib/api";
import { ME_KEY } from "../lib/auth";

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const reset = useMutation({
    mutationFn: () => api.post("/auth/reset-password", { token, password }),
    onSuccess: () => {
      // A reset ends every session, this browser's included.
      queryClient.setQueryData(ME_KEY, null);
      navigate("/sign-in?reset=1", { replace: true });
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
