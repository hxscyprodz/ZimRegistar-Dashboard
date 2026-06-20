import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  // Client-side guard (persisted auth lives in localStorage)
  if (typeof window !== "undefined") {
    const user = useAuth.getState().user;
    if (!user) throw redirect({ to: "/auth/login" });
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}