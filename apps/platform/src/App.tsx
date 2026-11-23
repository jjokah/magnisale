import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ErrorNote } from "./components/Form";
import { useMe } from "./lib/auth";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Privacy } from "./pages/Privacy";
import { Profile } from "./pages/Profile";
import { ResetPassword } from "./pages/ResetPassword";
import { Settings } from "./pages/Settings";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { Welcome } from "./pages/Welcome";

function Loading() {
  return (
    <p role="status" className="p-8 text-center text-fg-muted">
      Loading…
    </p>
  );
}

function LoadFailed() {
  return (
    <div className="mx-auto max-w-md p-8">
      <ErrorNote message="We could not reach Magnisale. Check your connection and refresh the page." />
    </div>
  );
}

/** Sign-in and sign-up: someone already signed in goes on to the app. */
function SignedOutOnly() {
  const me = useMe();
  if (me.isPending) return <Loading />;
  if (me.isError) return <LoadFailed />;
  if (me.data) return <Navigate to={me.data.needsOnboarding ? "/welcome" : "/profile"} replace />;
  return <Outlet />;
}

function SignedIn() {
  const me = useMe();
  const location = useLocation();
  if (me.isPending) return <Loading />;
  if (me.isError) return <LoadFailed />;
  if (!me.data) return <Navigate to="/sign-in" replace />;
  if (me.data.needsOnboarding && location.pathname !== "/welcome") return <Navigate to="/welcome" replace />;
  if (!me.data.needsOnboarding && location.pathname === "/welcome") return <Navigate to="/profile" replace />;
  return <Outlet />;
}

export function App() {
  return (
    <Routes>
      <Route element={<SignedOutOnly />}>
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route element={<SignedIn />}>
        <Route path="/welcome" element={<Welcome />} />
        <Route element={<AppShell />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/profile" replace />} />
    </Routes>
  );
}
