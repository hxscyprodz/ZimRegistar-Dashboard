import { create } from "zustand";
import { persist } from "zustand/middleware";
import { profileApi } from "./api";
import type {
  BirthCertificateApp,
  NationalIdApp,
  RecoveryApp,
  AppStatus,
  PrintStatus,
  Station,
} from "./types";
import { seedBirth, seedNationalId, seedRecovery } from "./mockData";

export type Role = "Super Administrator" | "Administrator" | "Supervisor" | "Registrar Officer";

interface AuthUser {
  id: string;
  employeeNumber: string;
  name: string;
  role: Role;
  stationId: string; // "ALL" for Super Administrator
}

export interface StaffMember {
  _id: string;
  staffId: string;
  firstName: string;
  surname: string;
  email: string;
  phone: string;
  nationalIdNumber: string;
  role: Role;
  stationId: string; // "ALL" for Super Administrator
  status: boolean;
  password: string;
}

interface AuthState {
  user: AuthUser | null;
  ready: boolean;
  restoreSession: () => Promise<void>;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  ready: false,
  restoreSession: async () => {
    // No token, no session
    if (typeof window === "undefined" || !window.localStorage.getItem("rg-token")) {
      set({ user: null, ready: true });
      return;
    }
    try {
      // Token found, fetch user profile
      const { user } = await profileApi();
      set({ user, ready: true });
    } catch (error) {
      // Token is invalid or API is down
      console.error("Failed to restore session:", error);
      window.localStorage.removeItem("rg-token");
      set({ user: null, ready: true });
    }
  },
  login: (user) => {
    set({ user, ready: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("rg-token");
    }
    set({ user: null, ready: true });
  },
}));

export function useUserStation(): string | null {
  const user = useAuth((s) => s.user);
  if (!user) return null;
  if (user.role === "Super Administrator") return null;
  return user.stationId;
}

export function filterByStation<T extends { stationId: string }>(
  list: T[],
  stationId: string | null,
): T[] {
  if (!stationId) return list;
  return list.filter((a) => a.stationId === stationId);
}

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
  setBirth: (data: BirthCertificateApp[]) => void;
  setNationalId: (data: NationalIdApp[]) => void;
  setRecovery: (data: RecoveryApp[]) => void;
  approve: (kind: "birth" | "nationalId" | "recovery", id: string, by: string) => void;
  reject: (
    kind: "birth" | "nationalId" | "recovery",
    id: string,
    reason: string,
    by: string,
  ) => void;
  markPrinted: (kind: "birth" | "nationalId" | "recovery", id: string) => void;
}

const updateStatus = <
  T extends {
    id: string;
    status: AppStatus;
    approvedAt?: string;
    approvedBy?: string;
    rejectionReason?: string;
    rejectedAt?: string;
    rejectedBy?: string;
    printStatus?: PrintStatus;
  },
>(
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
      setBirth: (data) => set({ birth: data }),
      setNationalId: (data) => set({ nationalId: data }),
      setRecovery: (data) => set({ recovery: data }),
      approve: (kind, id, by) =>
        set(
          (s) =>
            ({
              [kind]: updateStatus(s[kind] as never, id, {
                status: "Approved",
                approvedAt: new Date().toISOString(),
                approvedBy: by,
                printStatus: "Not Printed",
              } as never),
            }) as never,
        ),
      reject: (kind, id, reason, by) =>
        set(
          (s) =>
            ({
              [kind]: updateStatus(s[kind] as never, id, {
                status: "Rejected",
                rejectionReason: reason,
                rejectedAt: new Date().toISOString(),
                rejectedBy: by,
              } as never),
            }) as never,
        ),
      markPrinted: (kind, id) =>
        set(
          (s) =>
            ({
              [kind]: updateStatus(s[kind] as never, id, {
                printStatus: "Printed",
                printedAt: new Date().toISOString(),
              } as never),
            }) as never,
        ),
    }),
    { name: "rg-apps", version: 1 },
  ),
);
