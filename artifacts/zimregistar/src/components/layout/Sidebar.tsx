import { Link, useLocation } from "wouter";
import { LayoutDashboard, FileText, IdCard, FileSearch, CheckCircle2, Printer, BarChart3, Settings, ChevronLeft, Crown, Bell } from "lucide-react";
import { useUI, useAuth, useApps } from "@/lib/store";
import { cn } from "@/lib/utils";

const staffSections = [
  {
    label: null,
    items: [{ to: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
  },
  {
    label: "Applications",
    items: [
      { to: "/applications/birth-certificates", label: "Birth Certificates", icon: FileText },
      { to: "/applications/national-id", label: "National ID", icon: IdCard },
      { to: "/applications/document-recovery", label: "Document Recovery", icon: FileSearch },
    ]
  },
  {
    label: "Processing",
    items: [
      { to: "/approved-applications", label: "Approved", icon: CheckCircle2 },
      { to: "/printing-center", label: "Printing Centre", icon: Printer },
    ]
  },
  {
    label: "Administration",
    items: [
      { to: "/reports", label: "Reports", icon: BarChart3 },
      { to: "/settings", label: "Settings", icon: Settings },
    ]
  }
];

const superAdminSections = [
  { label: null, items: [{ to: "/super-admin", label: "System Overview", icon: Crown }] },
  { label: null, items: [{ to: "/settings", label: "Settings", icon: Settings }] }
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUI();
  const role = useAuth((s) => s.user?.role);
  const [location] = useLocation();
  const pendingCount = useApps((s) =>
    s.birth.filter(a => a.status === "Pending").length +
    s.nationalId.filter(a => a.status === "Pending").length +
    s.recovery.filter(a => a.status === "Pending").length
  );
  const isSuper = role === "Super Administrator";
  const isOfficer = role === "Registrar Officer";
  
  const sections = isSuper ? superAdminSections : staffSections.filter(sec => {
    if (isOfficer && sec.label === "Administration") {
      return { ...sec, items: sec.items.filter(i => i.to !== "/reports") };
    }
    return true;
  }).map(sec => {
    if (isOfficer && sec.label === "Administration") {
      return { ...sec, items: sec.items.filter(i => i.to !== "/reports") };
    }
    return sec;
  });

  return (
    <aside className={cn(
      "no-print sticky top-0 z-30 hidden h-screen shrink-0 border-r border-white/8 flex-col transition-all duration-200 md:flex",
      "bg-[hsl(215,67%,16%)]",
      sidebarCollapsed ? "w-[64px]" : "w-[240px]"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center border-b border-white/10 py-4",
        sidebarCollapsed ? "justify-center px-0" : "gap-3 px-4"
      )}>
        <img src="/logo.svg" alt="Zimbabwe" className="h-8 w-8 shrink-0 object-contain brightness-0 invert" />
        {!sidebarCollapsed && (
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-[0.12em] text-white/90 leading-none">Registrar General</p>
            <p className="truncate text-[10px] uppercase tracking-[0.08em] text-white/45 mt-0.5">Republic of Zimbabwe</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {sections.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-4" : ""}>
            {section.label && !sidebarCollapsed && (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35">
                {section.label}
              </p>
            )}
            {section.label && sidebarCollapsed && <div className="my-2 border-t border-white/10" />}
            {section.items.map((item) => {
              const active = location === item.to || location.startsWith(item.to + "/");
              const Icon = item.icon;
              const isNotifications = item.to === "/notifications";
              return (
                <Link key={item.to} href={item.to} className={cn(
                  "relative flex items-center gap-3 py-2 text-[13px] font-medium transition-colors duration-100",
                  sidebarCollapsed ? "justify-center px-0" : "px-3",
                  active
                    ? "text-white bg-white/8 before:absolute before:left-0 before:top-0 before:h-full before:w-[3px] before:bg-[#B8912A] before:rounded-r-sm"
                    : "text-white/55 hover:text-white/85 hover:bg-white/5"
                )}>
                  <Icon className={cn("h-4 w-4 shrink-0", active && "text-white")} />
                  {!sidebarCollapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!sidebarCollapsed && isNotifications && pendingCount > 0 && (
                    <span className="ml-auto min-w-[18px] rounded-sm bg-[#B8912A]/90 px-1 py-0.5 text-center text-[10px] font-bold leading-none text-white">
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                  )}
                  {sidebarCollapsed && item.to === "/notifications" && pendingCount > 0 && (
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#B8912A]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex items-center gap-2 border-t border-white/10 py-3 px-4 text-[11px] text-white/40 hover:text-white/70 transition-colors"
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")} />
        {!sidebarCollapsed && <span className="text-[11px]">Collapse</span>}
      </button>
    </aside>
  );
}