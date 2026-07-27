import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BirthCertificateApp, NationalIdApp, RecoveryApp, AppStatus, PrintStatus, Station } from "./types";
import { seedBirth, seedNationalId, seedRecovery } from "./mockData";

export type Role = "Super Administrator" | "Administrator" | "Supervisor" | "Registrar Officer";

export interface AuthUser { id: string; employeeNumber: string; name: string; role: Role; stationId: string; }

export interface StaffMember {
  _id: string; staffId: string; firstName: string; surname: string; email: string; phone: string;
  nationalIdNumber: string; role: Role; stationId: string; status: boolean; password: string;
}

interface AuthState {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => { if (typeof window !== "undefined") window.localStorage.removeItem("rg-token"); set({ user: null }); },
    }),
    { name: "rg-auth" }
  )
);

interface UIState { sidebarCollapsed: boolean; toggleSidebar: () => void; dark: boolean; toggleDark: () => void; }

export const useUI = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      dark: false,
      toggleDark: () => set((s) => { const next = !s.dark; if (typeof document !== "undefined") document.documentElement.classList.toggle("dark", next); return { dark: next }; }),
    }),
    { name: "rg-ui" }
  )
);

const updateItem = <T extends { id: string }>(arr: T[], id: string, patch: Partial<T>) =>
  arr.map((a) => (a.id === id ? { ...a, ...patch } : a));

interface AppsState {
  birth: BirthCertificateApp[]; nationalId: NationalIdApp[]; recovery: RecoveryApp[];
  setBirth: (d: BirthCertificateApp[]) => void; setNationalId: (d: NationalIdApp[]) => void; setRecovery: (d: RecoveryApp[]) => void;
  approve: (kind: "birth" | "nationalId" | "recovery", id: string, by: string) => void;
  reject: (kind: "birth" | "nationalId" | "recovery", id: string, reason: string, by: string) => void;
  markPrinted: (kind: "birth" | "nationalId" | "recovery", id: string) => void;
}

export const useApps = create<AppsState>()(
  persist(
    (set) => ({
      birth: seedBirth, nationalId: seedNationalId, recovery: seedRecovery,
      setBirth: (data) => set({ birth: data }),
      setNationalId: (data) => set({ nationalId: data }),
      setRecovery: (data) => set({ recovery: data }),
      approve: (kind, id, by) => set((s) => ({
        [kind]: updateItem(s[kind] as any, id, { status: "Approved", approvedAt: new Date().toISOString(), approvedBy: by, printStatus: "Not Printed" } as any)
      }) as any),
      reject: (kind, id, reason, by) => set((s) => ({
        [kind]: updateItem(s[kind] as any, id, { status: "Rejected", rejectionReason: reason, rejectedAt: new Date().toISOString(), rejectedBy: by } as any)
      }) as any),
      markPrinted: (kind, id) => set((s) => ({
        [kind]: updateItem(s[kind] as any, id, { printStatus: "Printed", printedAt: new Date().toISOString() } as any)
      }) as any),
    }),
    { name: "rg-apps", version: 1 }
  )
);

export function useUserStation(): string | null {
  const user = useAuth((s) => s.user);
  if (!user || user.role === "Super Administrator") return null;
  return user.stationId;
}

export function filterByStation<T extends { stationId: string }>(list: T[], stationId: string | null): T[] {
  if (!stationId) return list;
  return list.filter((a) => a.stationId === stationId);
}

// Mock login — accepts any 4+ char password, returns a mock user based on employee number
export async function mockLogin(identifier: string, _password: string): Promise<AuthUser> {
  await new Promise(r => setTimeout(r, 600));
  const id = identifier.toLowerCase();
  if (id.includes("super") || id === "rg-00001") {
    return { id: "u1", employeeNumber: "RG-00001", name: "T. Chimwemwe", role: "Super Administrator", stationId: "ALL" };
  }
  if (id.includes("admin") || id === "rg-00002") {
    return { id: "u2", employeeNumber: "RG-00002", name: "N. Moyo", role: "Administrator", stationId: "ST-HRE" };
  }
  if (id.includes("super") || id === "rg-00003") {
    return { id: "u3", employeeNumber: "RG-00003", name: "F. Ncube", role: "Supervisor", stationId: "ST-HRE" };
  }
  return { id: "u4", employeeNumber: "RG-00004", name: "C. Sibanda", role: "Registrar Officer", stationId: "ST-HRE" };
}

// Mock staff list
export const mockStaff: StaffMember[] = [
  { _id: "s1", staffId: "RG-00001", firstName: "T.", surname: "Chimwemwe", email: "t.chimwemwe@rg.gov.zw", phone: "+263 77 100 0001", nationalIdNumber: "63-1000001 A 10", role: "Super Administrator", stationId: "ALL", status: true, password: "" },
  { _id: "s2", staffId: "RG-00002", firstName: "N.", surname: "Moyo", email: "n.moyo@rg.gov.zw", phone: "+263 77 100 0002", nationalIdNumber: "63-1000002 A 10", role: "Administrator", stationId: "ST-HRE", status: true, password: "" },
  { _id: "s3", staffId: "RG-00003", firstName: "F.", surname: "Ncube", email: "f.ncube@rg.gov.zw", phone: "+263 77 100 0003", nationalIdNumber: "63-1000003 A 10", role: "Supervisor", stationId: "ST-HRE", status: true, password: "" },
  { _id: "s4", staffId: "RG-00004", firstName: "C.", surname: "Sibanda", email: "c.sibanda@rg.gov.zw", phone: "+263 77 100 0004", nationalIdNumber: "63-1000004 A 10", role: "Registrar Officer", stationId: "ST-HRE", status: true, password: "" },
  { _id: "s5", staffId: "RG-00005", firstName: "T.", surname: "Dube", email: "t.dube@rg.gov.zw", phone: "+263 77 100 0005", nationalIdNumber: "63-1000005 A 10", role: "Registrar Officer", stationId: "ST-BYO", status: false, password: "" },
];

// Mock stations
export const mockStations: Station[] = [
  { _id: "ST-HRE", stationId: "ST-HRE", stationName: "Harare Central Registry", location: { address: "6th Floor Makombe Building, Harare", province: "p-hre", district: "d-hre", town: "Harare" }, numberOfStaff: 12 },
  { _id: "ST-BYO", stationId: "ST-BYO", stationName: "Bulawayo Central Registry", location: { address: "Fife Avenue, Bulawayo", province: "p-mat", district: "d-byo", town: "Bulawayo" }, numberOfStaff: 8 },
  { _id: "ST-MUT", stationId: "ST-MUT", stationName: "Mutare District Registry", location: { address: "Aerodrome Road, Mutare", province: "p-man", district: "d-mut", town: "Mutare" }, numberOfStaff: 6 },
];