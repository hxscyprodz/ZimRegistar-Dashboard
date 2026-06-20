import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, IdCard, FileSearch, CheckCircle2, Printer, BarChart3, Settings, Shield, ChevronLeft,
} from "lucide-react";
import { useUI } from "@/lib/store";
import { cn } from "@/lib/utils";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/applications/birth-certificates", label: "Birth Certificates", icon: FileText },
  { to: "/applications/national-id", label: "National ID", icon: IdCard },
  { to: "/applications/document-recovery", label: "Document Recovery", icon: FileSearch },
  { to: "/approved-applications", label: "Approved", icon: CheckCircle2 },
  { to: "/printing-center", label: "Printing Center", icon: Printer },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUI();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside
      className={cn(
        "no-print sticky top-0 z-30 hidden h-screen shrink-0 border-r border-border bg-gov text-gov-foreground transition-all md:flex md:flex-col",
        sidebarCollapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold text-gold-foreground">
          <Shield className="h-5 w-5" />
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold leading-tight">Registrar General</p>
            <p className="truncate text-[11px] uppercase tracking-wider opacity-75">Republic of Zimbabwe</p>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
        {items.map((it) => {
          const active = pathname === it.to || pathname.startsWith(it.to + "/");
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              )}
              title={sidebarCollapsed ? it.label : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0", active && "text-gold")} />
              {!sidebarCollapsed && <span className="truncate">{it.label}</span>}
              {active && !sidebarCollapsed && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={toggleSidebar}
        className="flex items-center justify-center gap-2 border-t border-white/10 py-3 text-xs text-white/70 hover:text-white"
      >
        <ChevronLeft className={cn("h-4 w-4 transition", sidebarCollapsed && "rotate-180")} />
        {!sidebarCollapsed && "Collapse"}
      </button>
    </aside>
  );
}
