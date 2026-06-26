/**
 * API client stubs for the Registrar General Backend.
 *
 * All functions currently delegate to the in-memory Zustand stores (mock data)
 * so the UI keeps working before the backend is ready. When your backend is
 * available:
 *
 *   1. Set `VITE_API_BASE_URL` in `.env` (e.g. https://api.rg.gov.zw).
 *   2. Uncomment the `// return request(...)` line in each function below.
 *   3. Delete the mock fallback line above it.
 *
 * Endpoint shapes are documented per-function and follow REST conventions.
 */
import type {
  BirthCertificateApp,
  NationalIdApp,
  RecoveryApp,
} from "./types";
import { useApps, useStaff, type StaffMember } from "./store";

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Generic fetch wrapper. Attaches auth token from localStorage if present. */
export async function request<T>(
  path: string,
  options: { method?: HttpMethod; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("rg-token") : null;
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
export async function loginApi(employeeNumber: string, password: string) {
  // return request<{ token: string; user: { employeeNumber: string; name: string; role: string } }>(
  //   "/auth/login",
  //   { method: "POST", body: { employeeNumber, password } },
  // );
  const staff = useStaff.getState().staff;
  const match = staff.find(
    (s) => s.employeeNumber.toLowerCase() === employeeNumber.toLowerCase() && s.password === password,
  );
  if (!match || !match.active) throw new Error("Invalid credentials");
  return {
    token: `mock-token-${match.id}`,
    user: { employeeNumber: match.employeeNumber, name: `${match.firstName} ${match.lastName}`, role: match.role },
  };
}

/** POST /auth/logout */
export async function logoutApi() {
  // return request<void>("/auth/logout", { method: "POST" });
  return;
}

/* ------------------------------------------------------------------ */
/* Staff                                                               */
/* ------------------------------------------------------------------ */

/** GET /staff */
export async function listStaffApi(): Promise<StaffMember[]> {
  // return request<StaffMember[]>("/staff");
  return useStaff.getState().staff;
}

/** POST /staff */
export async function createStaffApi(payload: Omit<StaffMember, "id">): Promise<StaffMember> {
  // return request<StaffMember>("/staff", { method: "POST", body: payload });
  useStaff.getState().addStaff(payload);
  const created = useStaff.getState().staff.at(-1)!;
  return created;
}

/** PUT /staff/:id */
export async function updateStaffApi(id: string, patch: Partial<StaffMember>): Promise<StaffMember> {
  // return request<StaffMember>(`/staff/${id}`, { method: "PUT", body: patch });
  useStaff.getState().updateStaff(id, patch);
  return useStaff.getState().staff.find((s) => s.id === id)!;
}

/** PATCH /staff/:id/active  →  toggles or sets active state */
export async function toggleStaffActiveApi(id: string): Promise<StaffMember> {
  // return request<StaffMember>(`/staff/${id}/active`, { method: "PATCH" });
  useStaff.getState().toggleActive(id);
  return useStaff.getState().staff.find((s) => s.id === id)!;
}

/** DELETE /staff/:id */
export async function deleteStaffApi(id: string): Promise<void> {
  // return request<void>(`/staff/${id}`, { method: "DELETE" });
  useStaff.getState().deleteStaff(id);
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