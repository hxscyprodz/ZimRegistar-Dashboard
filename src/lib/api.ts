import type { BirthCertificateApp, NationalIdApp, RecoveryApp, Station } from "./types";
import { useApps, useStaff, type StaffMember, Role } from "./store";

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Generic fetch wrapper. Attaches auth token from localStorage if present. */
export async function request<T>(
  path: string,
  options: { method?: HttpMethod; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("rg-token") : null;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

/** POST /auth/login  →  { token, user } */
export function loginApi(phone: string, password: string) {
  // The user object from the API should match the AuthUser interface in store.ts
  type LoginResponse = {
    token: string;
    user: {
      employeeNumber: string;
      name: string;
      role: "Super Administrator" | "Administrator" | "Supervisor" | "Registrar Officer";
      stationId: string;
    };
  };
  return request<LoginResponse>("/auth/login", { method: "POST", body: { phone, password } });
}

/** GET /auth/profile  →  user */
export function profileApi() {
  return request<{
    success: true;
    user: { employeeNumber: string; name: string; role: Role; stationId: string };
  }>("/auth/profile");
}

/** POST /auth/logout */
export async function logoutApi() {
  // return request<void>("/auth/logout", { method: "POST" });
  return;
}

/* ------------------------------------------------------------------ */
/* Staff                                                               */
/* ------------------------------------------------------------------ */
interface StaffResponse {
  success: true;
  data: StaffMember[];
}

/** GET /staff */
export async function listStaffApi(): Promise<StaffResponse> {
  return request<StaffResponse>("/staff");
}

/** POST /staff */
export async function createStaffApi(
  payload: Omit<StaffMember, "id" | "staffId">,
): Promise<StaffMember> {
  return request<StaffMember>("/staff", { method: "POST", body: payload });
}

/** PUT /staff/:id */
export async function updateStaffApi(
  id: string,
  patch: Partial<StaffMember>,
): Promise<StaffMember> {
  return request<StaffMember>(`/staff/${id}`, { method: "PUT", body: patch });
}

/** PATCH /staff/:id/active  →  toggles or sets active state */
export async function toggleStaffActiveApi(id: string): Promise<StaffMember> {
  return request<StaffMember>(`/staff/${id}/active`, { method: "PATCH" });
}

/** DELETE /staff/:id */
export async function deleteStaffApi(id: string): Promise<void> {
  return request<void>(`/staff/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/* Stations                                                           */
/* ------------------------------------------------------------------ */

/** GET /stations */
export async function listStationsApi(): Promise<{ success: true; data: Station[] }> {
  return request<{ success: true; data: Station[] }>("/stations");
}

/** POST /stations */
export async function createStationApi(
  payload: Omit<Station, "id" | "stationId">,
): Promise<Station> {
  return request<Station>("/stations", { method: "POST", body: payload });
}

/** PUT /stations/:id */
export async function updateStationApi(id: string, patch: Partial<Station>): Promise<Station> {
  return request<Station>(`/stations/${id}`, { method: "PUT", body: patch });
}

/** DELETE /stations/:id */
export async function deleteStationApi(id: string): Promise<void> {
  return request<void>(`/stations/${id}`, { method: "DELETE" });
}

/* ------------------------------------------------------------------ */
/* Applications                                                        */
/* ------------------------------------------------------------------ */

export type AppKind = "birth" | "nationalId" | "recovery";

const endpointFor = (kind: AppKind) =>
  kind === "birth"
    ? "/applications/birth-certificates"
    : kind === "nationalId"
      ? "/applications/national-id"
      : "/applications/document-recovery";

/** GET /applications/birth-certificates */
export async function listBirthApi(): Promise<BirthCertificateApp[]> {
  // return request<BirthCertificateApp[]>(endpointFor("birth"));
  return useApps.getState().birth;
}

/** GET /applications/national-id */
export async function listNationalIdApi(): Promise<NationalIdApp[]> {
  // return request<NationalIdApp[]>(endpointFor("nationalId"));
  return useApps.getState().nationalId;
}

/** GET /applications/document-recovery */
export async function listRecoveryApi(): Promise<RecoveryApp[]> {
  // return request<RecoveryApp[]>(endpointFor("recovery"));
  return useApps.getState().recovery;
}

/** GET /applications/:kind/:id */
export async function getApplicationApi(kind: AppKind, id: string) {
  // return request(`${endpointFor(kind)}/${id}`);
  return useApps.getState()[kind].find((a) => a.id === id) ?? null;
}

/** POST /applications/:kind/:id/approve */
export async function approveApplicationApi(kind: AppKind, id: string, by: string) {
  // return request(`${endpointFor(kind)}/${id}/approve`, { method: "POST", body: { by } });
  useApps.getState().approve(kind, id, by);
}

/** POST /applications/:kind/:id/reject */
export async function rejectApplicationApi(kind: AppKind, id: string, reason: string, by: string) {
  // return request(`${endpointFor(kind)}/${id}/reject`, { method: "POST", body: { reason, by } });
  useApps.getState().reject(kind, id, reason, by);
}

/** POST /applications/:kind/:id/print  →  mark printed */
export async function markPrintedApi(kind: AppKind, id: string) {
  // return request(`${endpointFor(kind)}/${id}/print`, { method: "POST" });
  useApps.getState().markPrinted(kind, id);
}

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

/** GET /reports/summary?from=...&to=... */
export async function getReportsSummaryApi(_params?: { from?: string; to?: string }) {
  // return request("/reports/summary", { method: "GET" });
  const { birth, nationalId, recovery } = useApps.getState();
  return {
    totals: {
      birth: birth.length,
      nationalId: nationalId.length,
      recovery: recovery.length,
    },
  };
}
