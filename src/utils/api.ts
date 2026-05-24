import { projectId, publicAnonKey } from "../../utils/supabase/info";

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a2aa1d47`;

// ─── Request helper ───────────────────────────────────────────────────────────

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
      ...(init?.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? `Request failed: ${res.status}`);
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = "Admin" | "Supervisor" | "Worker";

export interface ApiUser {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: UserRole;
  mustChangePassword?: boolean;
  hallId?: string;
  congregation?: string;
  phoneNumbers?: string[];
  gender?: "Male" | "Female";
}

export interface ApiHall {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  gpsCoordinates?: string;
  congregation?: string[];
}

export interface HazardEntry {
  id: string;
  description: string;
  risk: "Low" | "Medium" | "High";
  category: string;
  controlType: string;
  control: string;
  photos: string[];
}

export interface StepEntry {
  id: string;
  description: string;
  hazards: HazardEntry[];
}

export type JHAStatus = "Pending" | "Approved" | "Rejected";
export type RiskLevel = "Low" | "Medium" | "High";

export interface ApiJHA {
  ref: string;
  job: string;
  submittedBy: string;
  site: string;
  date: string;
  isoDate?: string;
  status: JHAStatus;
  risk: RiskLevel;
  supervisor?: string;
  steps?: StepEntry[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<ApiUser> {
  const data = await request<{ user: ApiUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return data.user;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<ApiUser[]> {
  return request<ApiUser[]>("/users");
}

export async function createUser(payload: {
  name: string;
  email: string;
  role: UserRole;
  password: string;
  mustChangePassword?: boolean;
  hallId?: string;
  congregation?: string;
  phoneNumbers?: string[];
  gender?: "Male" | "Female";
}): Promise<ApiUser> {
  const data = await request<{ user: ApiUser }>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.user;
}

export async function updateUser(
  id: string,
  payload: Partial<{
    name: string; email: string; role: UserRole; password: string; mustChangePassword: boolean;
    hallId: string; congregation: string; phoneNumbers: string[]; gender: "Male" | "Female";
  }>
): Promise<ApiUser> {
  const data = await request<{ user: ApiUser }>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.user;
}

export async function deleteUser(id: string): Promise<void> {
  await request(`/users/${id}`, { method: "DELETE" });
}

// ─── Halls ────────────────────────────────────────────────────────────────────

export async function getHalls(): Promise<ApiHall[]> {
  return request<ApiHall[]>("/halls");
}

export async function createHall(payload: {
  name: string; address?: string; phone?: string; gpsCoordinates?: string; congregation?: string[];
}): Promise<ApiHall> {
  const data = await request<{ hall: ApiHall }>("/halls", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.hall;
}

export async function updateHall(id: string, payload: {
  name?: string; address?: string; phone?: string; gpsCoordinates?: string; congregation?: string[];
}): Promise<ApiHall> {
  const data = await request<{ hall: ApiHall }>(`/halls/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.hall;
}

export async function deleteHall(id: string): Promise<void> {
  await request(`/halls/${id}`, { method: "DELETE" });
}

// ─── JHAs ─────────────────────────────────────────────────────────────────────

export async function getJHAs(): Promise<ApiJHA[]> {
  return request<ApiJHA[]>("/jhas");
}

export async function createJHA(payload: Partial<ApiJHA>): Promise<ApiJHA> {
  const data = await request<{ jha: ApiJHA }>("/jhas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.jha;
}

export async function updateJHA(ref: string, payload: Partial<ApiJHA>): Promise<ApiJHA> {
  const data = await request<{ jha: ApiJHA }>(`/jhas/${encodeURIComponent(ref)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.jha;
}

export async function deleteJHA(ref: string): Promise<void> {
  await request(`/jhas/${encodeURIComponent(ref)}`, { method: "DELETE" });
}
