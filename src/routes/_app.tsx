import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [hydrated, setHydrated] = useState(false);
  const user = useAuth((s) => s.user);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => setHydrated(true), []);
  if (hydrated && !user) {
    return <Navigate to="/auth/login" />;
  }
  // Super Administrator lands on their own console.
  if (
    hydrated &&
    user?.role === "Super Administrator" &&
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