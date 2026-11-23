import { Button, ErrorNote, TextField } from "@magnisale/ui";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthLayout, ConsentCheckbox } from "../../components/AuthLayout";
import { api, call, errorMessage } from "../../lib/api";
import { meQuery, refreshMe } from "../../lib/auth";

export const Route = createFileRoute("/_auth/welcome")({
  beforeLoad: async ({ context }) => {
    const me = await context.queryClient.fetchQuery(meQuery);
    if (!me) throw redirect({ to: "/sign-in", replace: true });
    if (!me.needsOnboarding) throw redirect({ to: "/profiler", replace: true });
  },
  component: Welcome,
});

/** The last step for people who signed up with Google. */
function Welcome() {
  const [companyName, setCompanyName] = useState("");
  const [consent, setConsent] = useState(false);
  const navigate = useNavigate();
  const finish = useMutation({
    mutationFn: () => call(api.account.onboarding.$post({ json: { companyName, consent: consent as true } })),
    onSuccess: async () => {
      await refreshMe();
      await navigate({ to: "/profiler", replace: true });
    },
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
