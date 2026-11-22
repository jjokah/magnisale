import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { AuthLayout, ConsentCheckbox } from "../components/AuthLayout";
import { Button, ErrorNote, TextField } from "../components/Form";
import { api, errorMessage } from "../lib/api";
import { ME_KEY } from "../lib/auth";

/** The last step for people who signed up with Google. */
export function Welcome() {
  const [companyName, setCompanyName] = useState("");
  const [consent, setConsent] = useState(false);
  const queryClient = useQueryClient();
  const finish = useMutation({
    mutationFn: () => api.post("/auth/complete-onboarding", { companyName, consent }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ME_KEY }),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    finish.mutate();
  }

  return (
    <AuthLayout title="One last step" lede="Tell us which business this profile is for.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        {finish.isError && <ErrorNote message={errorMessage(finish.error)} />}
        <TextField label="Company name" autoComplete="organization" required autoFocus value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        <ConsentCheckbox checked={consent} onChange={setConsent} />
        <Button type="submit" disabled={finish.isPending} className="w-full">
          {finish.isPending ? "Setting up…" : "Continue"}
        </Button>
      </form>
    </AuthLayout>
  );
}
