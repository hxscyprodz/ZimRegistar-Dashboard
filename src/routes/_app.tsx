import { createFileRoute, Outlet, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const [hydrated, setHydrated] = useState(false);
  const user = useAuth((s) => s.user);
  useEffect(() => setHydrated(true), []);
  if (hydrated && !user) {
    return <Navigate to="/auth/login" />;
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}