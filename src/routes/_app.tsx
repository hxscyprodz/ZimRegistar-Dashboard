import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const user = useAuth((s) => s.user);
  const [authReady, setAuthReady] = useState(() => useAuth.persist.hasHydrated());
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const unsub = useAuth.persist.onFinishHydration(() => setAuthReady(true));
    setAuthReady(useAuth.persist.hasHydrated());
    return unsub;
  }, []);

  if (!authReady) {
    return <div className="min-h-screen bg-background" aria-label="Loading secure session" />;
  }

  if (!user) {
    return <Navigate to="/auth/login" />;
  }
  // Super Administrator lands on their own console.
  if (
    user.role === "Super Administrator" &&
    (pathname === "/" || pathname === "/dashboard")
  ) {
    return <Navigate to="/super-admin" />;
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}