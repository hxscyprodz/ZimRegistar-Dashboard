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

export function nextEmployeeNumber(existing: StaffMember[]): string {
  const nums = existing
    .map((s) => {
      const m = s.staffId.match(/RG-(\d+)/i);
      return m ? parseInt(m[1], 10) : 0;
    })
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 10000) + 1;
  return `RG-${String(next).padStart(5, "0")}`;
}

export const MOCK_STATIONS: Station[] = [
  {
    stationId: "ST-HRE",
    stationName: "Harare Central Registry",
    location: {
      province: "Harare",
      district: "Harare Metro",
      town: "Harare",
    },
    numberOfStaff: 3,
  },
  {
    stationId: "ST-BYO",
    stationName: "Bulawayo Central Registry",
    location: {
      province: "Bulawayo",
      district: "Bulawayo Metro",
      town: "Bulawayo",
    },
    numberOfStaff: 5,
  },
  {
    stationId: "ST-MUT",
    stationName: "Mutare District Registry",
    location: {
      province: "Manicaland",
      district: "Mutare",
      town: "Mutare",
    },
    numberOfStaff: 8,
  },
];

export const MOCK_STAFF: StaffMember[] = [
  {
    id: "u-0",
    staffId: "RG-00001",
    firstName: "Chiedza",
    surname: "Marufu",
    email: "c.marufu@rg.gov.zw",
    phone: "+263 772 000 001",
    nationalIdNumber: "63-0000001-Z-00",
    role: "Super Administrator",
    stationId: "ALL",
    status: true,
    password: "root1234",
  },
  {
    id: "u-1",
    staffId: "RG-01902",
    firstName: "Rumbidzai",
    surname: "Sibanda",
    email: "r.sibanda@rg.gov.zw",
    phone: "+263 772 100 001",
    nationalIdNumber: "63-1234567-A-12",
    role: "Administrator",
    stationId: "ST-HRE",
    status: true,
    password: "admin1234",
  },
  {
    id: "u-2",
    staffId: "RG-03317",
    firstName: "Nyasha",
    surname: "Dube",
    email: "n.dube@rg.gov.zw",
    phone: "+263 772 100 002",
    nationalIdNumber: "63-7654321-B-08",
    role: "Supervisor",
    stationId: "ST-HRE",
    status: true,
    password: "super1234",
  },
  {
    id: "u-3",
    staffId: "RG-04821",
    firstName: "Tafadzwa",
    surname: "Moyo",
    email: "t.moyo@rg.gov.zw",
    phone: "+263 772 100 003",
    nationalIdNumber: "63-9988776-C-25",
    role: "Registrar Officer",
    stationId: "ST-BYO",
    status: true,
    password: "officer1234",
  },
  {
    id: "u-4",
    staffId: "RG-05512",
    firstName: "Tinashe",
    surname: "Mhandu",
    email: "t.mhandu@rg.gov.zw",
    phone: "+263 772 100 004",
    nationalIdNumber: "63-5544332-D-19",
    role: "Registrar Officer",
    stationId: "ST-MUT",
    status: false,
    password: "officer1234",
  },
];

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
          staff: state.staff.map((m) => (m.id === id ? { ...m, status: !m.status } : m)),
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
