import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BirthCertificateApp, NationalIdApp, RecoveryApp, AppStatus, PrintStatus } from "./types";
import { seedBirth, seedNationalId, seedRecovery } from "./mockData";

interface AuthUser {
  employeeNumber: string;
  name: string;
  role: "Administrator" | "Supervisor" | "Registrar Officer";
}

interface AuthState {
  user: AuthUser | null;
  login: (employeeNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (employeeNumber, password) => {
        await new Promise((r) => setTimeout(r, 600));
        if (!employeeNumber || password.length < 4) return false;
        set({
          user: {
            employeeNumber,
            name: "T. Moyo",
            role: "Registrar Officer",
          },
        });
        return true;
      },
      logout: () => set({ user: null }),
    }),
    { name: "rg-auth" },
  ),
);

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  dark: boolean;
  toggleDark: () => void;
}

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      dark: false,
      toggleDark: () =>
        set((s) => {
          const next = !s.dark;
          if (typeof document !== "undefined") {
            document.documentElement.classList.toggle("dark", next);
          }
          return { dark: next };
        }),
    }),
    { name: "rg-ui" },
  ),
);

interface AppsState {
  birth: BirthCertificateApp[];
  nationalId: NationalIdApp[];
  recovery: RecoveryApp[];
  approve: (kind: "birth" | "nationalId" | "recovery", id: string, by: string) => void;
  reject: (kind: "birth" | "nationalId" | "recovery", id: string, reason: string, by: string) => void;
  markPrinted: (kind: "birth" | "nationalId" | "recovery", id: string) => void;
}

const updateStatus = <T extends { id: string; status: AppStatus; approvedAt?: string; approvedBy?: string; rejectionReason?: string; rejectedAt?: string; rejectedBy?: string; printStatus?: PrintStatus }>(
  arr: T[],
  id: string,
  patch: Partial<T>,
) => arr.map((a) => (a.id === id ? { ...a, ...patch } : a));

export const useApps = create<AppsState>()(
  persist(
    (set) => ({
      birth: seedBirth,
      nationalId: seedNationalId,
      recovery: seedRecovery,
      approve: (kind, id, by) =>
        set((s) => ({
          [kind]: updateStatus(s[kind] as never, id, {
            status: "Approved",
            approvedAt: new Date().toISOString(),
            approvedBy: by,
            printStatus: "Not Printed",
          } as never),
        }) as never),
      reject: (kind, id, reason, by) =>
        set((s) => ({
          [kind]: updateStatus(s[kind] as never, id, {
            status: "Rejected",
            rejectionReason: reason,
            rejectedAt: new Date().toISOString(),
            rejectedBy: by,
          } as never),
        }) as never),
      markPrinted: (kind, id) =>
        set((s) => ({
          [kind]: updateStatus(s[kind] as never, id, {
            printStatus: "Printed",
            printedAt: new Date().toISOString(),
          } as never),
        }) as never),
    }),
    { name: "rg-apps", version: 1 },
  ),
);