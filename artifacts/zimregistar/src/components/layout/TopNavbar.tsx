import { Bell, LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth, useUI, useApps } from "@/lib/store";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Operations Dashboard",
  "/applications/birth-certificates": "Birth Certificate Applications",
  "/applications/national-id": "National ID Applications",
  "/applications/document-recovery": "Document Recovery Applications",
  "/approved-applications": "Approved Applications",
  "/printing-center": "Printing Centre",
  "/reports": "Reports & Analytics",
  "/settings": "Settings",
  "/notifications": "Notifications",
  "/super-admin": "Super Administrator Console",
};

export function TopNavbar() {
  const { user, logout } = useAuth();
  const { toggleSidebar, dark, toggleDark } = useUI();
  const [location, navigate] = useLocation();
  const pendingCount = useApps((s) =>
    s.birth.filter(a => a.status === "Pending").length +
    s.nationalId.filter(a => a.status === "Pending").length +
    s.recovery.filter(a => a.status === "Pending").length
  );
  
  const pageTitle = Object.entries(PAGE_TITLES).find(([k]) => location.startsWith(k))?.[1] ?? "Dashboard";
  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2) ?? "RG";

  return (
    <header className="no-print sticky top-0 z-20 flex h-14 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={toggleSidebar}>
        <Menu className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-[11px] uppercase tracking-[0.1em] font-semibold text-muted-foreground hidden sm:block">
          Registrar General's Office
        </span>
        <span className="text-muted-foreground/50 hidden sm:block">/</span>
        <span className="text-sm font-semibold text-foreground truncate">{pageTitle}</span>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleDark}>
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8"
          onClick={() => navigate("/notifications")}
        >
          <Bell className="h-4 w-4" />
          {pendingCount > 0 && (
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded border border-border bg-card px-2.5 py-1.5 text-left transition hover:bg-muted">
              <div className="grid h-6 w-6 shrink-0 place-items-center rounded-sm bg-primary text-[11px] font-bold text-primary-foreground">
                {initials}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-[12px] font-semibold leading-tight">{user?.name ?? "Officer"}</p>
                <p className="truncate text-[10px] text-muted-foreground leading-tight">{user?.role ?? "Staff"}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground font-normal">Emp #: {user?.employeeNumber}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <User className="mr-2 h-4 w-4" /> Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { logout(); navigate("/auth/login"); }}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}