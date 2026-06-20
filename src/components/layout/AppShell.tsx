import type { ReactNode } from "react";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { useUI } from "@/lib/store";

export function AppShell({ children }: { children: ReactNode }) {
  const dark = useUI((s) => s.dark);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar />
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}