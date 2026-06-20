import { Bell, LogOut, Menu, Moon, Sun, User } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useUI } from "@/lib/store";

export function TopNavbar() {
  const { user, logout } = useAuth();
  const { toggleSidebar, dark, toggleDark } = useUI();
  const navigate = useNavigate();
  return (
    <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
      </Button>
      <div className="min-w-0">
        <p className="truncate font-display text-sm font-semibold">Digital Document Management</p>
        <p className="hidden text-xs text-muted-foreground sm:block">Registrar General's Office · Zimbabwe</p>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <Button variant="ghost" size="icon" onClick={toggleDark} title="Toggle theme">
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" className="relative" title="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-gold text-[10px] font-bold text-gold-foreground">3</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-left transition hover:bg-muted">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-gov text-xs font-bold text-gov-foreground">
                {user?.name?.split(" ").map((w) => w[0]).join("").slice(0, 2) ?? "RG"}
              </div>
              <div className="hidden min-w-0 sm:block">
                <p className="truncate text-xs font-semibold leading-tight">{user?.name ?? "Officer"}</p>
                <p className="truncate text-[10px] text-muted-foreground">{user?.role ?? "Staff"}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Emp #: {user?.employeeNumber}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>
              <User className="mr-2 h-4 w-4" /> Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => { logout(); navigate({ to: "/auth/login" }); }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
