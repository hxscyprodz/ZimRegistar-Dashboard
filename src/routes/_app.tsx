import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth, useApps } from "@/lib/store";
import { listBirthApi, listNationalIdApi, listRecoveryApi } from "@/lib/api";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const user = useAuth((s) => s.user);
  const { ready: authReady, restoreSession } = useAuth.getState();
  const { setBirth, setNationalId, setRecovery } = useApps.getState();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    restoreSession();
    listBirthApi().then((res) => setBirth(res.data));
    listNationalIdApi().then((res) => setNationalId(res.data));
    listRecoveryApi().then((data) => setRecovery(data));
  }, [restoreSession, setBirth, setNationalId, setRecovery]);

  if (!authReady) {
    return <div className="min-h-screen bg-background" aria-label="Loading secure session" />;
  }

  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  if (user.role === "Super Administrator" && (pathname === "/" || pathname === "/dashboard")) {
    return <Navigate to="/super-admin" />;
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
