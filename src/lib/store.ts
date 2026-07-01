import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BirthCertificateApp, NationalIdApp, RecoveryApp, AppStatus, PrintStatus } from "./types";
import { seedBirth, seedNationalId, seedRecovery } from "./mockData";

export type Role = "Administrator" | "Supervisor" | "Registrar Officer";

interface AuthUser {
  employeeNumber: string;
  name: string;
  role: Role;
}

export interface StaffMember {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationalId: string;
  role: Role;
  active: boolean;
  password: string;
}

export function nextEmployeeNumber(existing: StaffMember[]): string {
  const nums = existing
    .map((s) => {
      const m = s.employeeNumber.match(/RG-(\d+)/i);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 10000) + 1;
  return `RG-${String(next).padStart(5, "0")}`;
}

export const MOCK_STAFF: StaffMember[] = [
  {
    id: "u-1",
    employeeNumber: "RG-01902",
    firstName: "Rumbidzai",
    lastName: "Sibanda",
    email: "r.sibanda@rg.gov.zw",
    phone: "+263 772 100 001",
    nationalId: "63-1234567-A-12",
    role: "Administrator",
    active: true,
    password: "admin1234",
  },
  {
    id: "u-2",
    employeeNumber: "RG-03317",
    firstName: "Nyasha",
    lastName: "Dube",
    email: "n.dube@rg.gov.zw",
    phone: "+263 772 100 002",
    nationalId: "63-7654321-B-08",
    role: "Supervisor",
    active: true,
    password: "super1234",
  },
  {
    id: "u-3",
    employeeNumber: "RG-04821",
    firstName: "Tafadzwa",
    lastName: "Moyo",
    email: "t.moyo@rg.gov.zw",
    phone: "+263 772 100 003",
    nationalId: "63-9988776-C-25",
    role: "Registrar Officer",
    active: true,
    password: "officer1234",
  },
  {
    id: "u-4",
    employeeNumber: "RG-05512",
    firstName: "Tinashe",
    lastName: "Mhandu",
    email: "t.mhandu@rg.gov.zw",
    phone: "+263 772 100 004",
    nationalId: "63-5544332-D-19",
    role: "Registrar Officer",
    active: false,
    password: "officer1234",
  },
];

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
        const staff = useStaff.getState().staff;
        const match = staff.find(
          (s) => s.employeeNumber.toLowerCase() === employeeNumber.toLowerCase() && s.password === password,
        );
        if (!match || !match.active) return false;
        set({
          user: {
            employeeNumber: match.employeeNumber,
            name: `${match.firstName} ${match.lastName}`,
            role: match.role,
          },
        });
        return true;
      },
      logout: () => set({ user: null }),
    }),
    { name: "rg-auth", version: 2 },
  ),
);

interface StaffState {
  staff: StaffMember[];
  addStaff: (s: Omit<StaffMember, "id">) => void;
  updateStaff: (id: string, patch: Partial<StaffMember>) => void;
  toggleActive: (id: string) => void;
  deleteStaff: (id: string) => void;
}

export const useStaff = create<StaffState>()(
  persist(
    (set) => ({
      staff: MOCK_STAFF,
      addStaff: (s) =>
        set((state) => ({
          staff: [...state.staff, { ...s, id: `u-${Date.now()}` }],
        })),
      updateStaff: (id, patch) =>
        set((state) => ({
          staff: state.staff.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        })),
      toggleActive: (id) =>
        set((state) => ({
          staff: state.staff.map((m) => (m.id === id ? { ...m, active: !m.active } : m)),
        })),
      deleteStaff: (id) =>
        set((state) => ({
          staff: state.staff.filter((m) => m.id !== id),
        })),
    }),
    { name: "rg-staff", version: 1 },
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