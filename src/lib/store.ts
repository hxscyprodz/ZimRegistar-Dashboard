import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BirthCertificateApp, NationalIdApp, RecoveryApp, AppStatus, PrintStatus, Station } from "./types";
import { seedBirth, seedNationalId, seedRecovery } from "./mockData";

export type Role = "Super Administrator" | "Administrator" | "Supervisor" | "Registrar Officer";

interface AuthUser {
  employeeNumber: string;
  name: string;
  role: Role;
  stationId: string; // "ALL" for Super Administrator
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
  stationId: string; // "ALL" for Super Administrator
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

export const MOCK_STATIONS: Station[] = [
  { id: "ST-HRE", name: "Harare Central Registry", province: "Harare", district: "Harare Metro", town: "Harare" },
  { id: "ST-BYO", name: "Bulawayo Central Registry", province: "Bulawayo", district: "Bulawayo Metro", town: "Bulawayo" },
  { id: "ST-MUT", name: "Mutare District Registry", province: "Manicaland", district: "Mutare", town: "Mutare" },
];

export const MOCK_STAFF: StaffMember[] = [
  {
    id: "u-0",
    employeeNumber: "RG-00001",
    firstName: "Chiedza",
    lastName: "Marufu",
    email: "c.marufu@rg.gov.zw",
    phone: "+263 772 000 001",
    nationalId: "63-0000001-Z-00",
    role: "Super Administrator",
    stationId: "ALL",
    active: true,
    password: "root1234",
  },
  {
    id: "u-1",
    employeeNumber: "RG-01902",
    firstName: "Rumbidzai",
    lastName: "Sibanda",
    email: "r.sibanda@rg.gov.zw",
    phone: "+263 772 100 001",
    nationalId: "63-1234567-A-12",
    role: "Administrator",
    stationId: "ST-HRE",
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
    stationId: "ST-HRE",
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
    stationId: "ST-BYO",
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
    stationId: "ST-MUT",
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
            stationId: match.stationId,
          },
        });
        return true;
      },
      logout: () => set({ user: null }),
    }),
    {
      name: "rg-auth-session",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user }),
    },
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
    { name: "rg-staff", version: 2 },
  ),
);

interface StationsState {
  stations: Station[];
  addStation: (s: Omit<Station, "id">) => void;
  updateStation: (id: string, patch: Partial<Station>) => void;
  deleteStation: (id: string) => void;
}

function nextStationId(existing: Station[]): string {
  const nums = existing
    .map((s) => {
      const m = s.id.match(/ST-(\d+)/i);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 100) + 1;
  return `ST-${String(next).padStart(4, "0")}`;
}

export const useStations = create<StationsState>()(
  persist(
    (set, get) => ({
      stations: MOCK_STATIONS,
      addStation: (s) =>
        set((state) => ({
          stations: [...state.stations, { ...s, id: nextStationId(get().stations) }],
        })),
      updateStation: (id, patch) =>
        set((state) => ({
          stations: state.stations.map((st) => (st.id === id ? { ...st, ...patch } : st)),
        })),
      deleteStation: (id) =>
        set((state) => ({
          stations: state.stations.filter((st) => st.id !== id),
        })),
    }),
    { name: "rg-stations", version: 1 },
  ),
);

/**
 * Returns the stationId currently active user is scoped to, or null when
 * the user is a Super Administrator (sees everything).
 */
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