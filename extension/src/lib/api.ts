import { getLocalSettings } from "./storage.ts";

async function getConfig() {
  return getLocalSettings();
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { apiUrl, authToken } = await getConfig();
  if (!apiUrl) throw new Error("API URL not configured");

  const url = `${apiUrl.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export interface Email {
  id: string;
  messageId: string | null;
  sender: string;
  fromHeader: string;
  toHeader: string;
  subject: string;
  bodyPreview: string | null;
  rawSize: number | null;
  spfPass: boolean | null;
  dkimPass: boolean | null;
  status: "pending" | "approved" | "rejected" | "forwarded";
  classification: string | null;
  classificationReason: string | null;
  rawStorageKey: string | null;
  createdAt: string;
  actionedAt: string | null;
}

export interface Sender {
  address: string;
  displayName: string | null;
  status: "allowed" | "blocked" | "unknown";
  emailCount: number | null;
  firstSeen: string;
  lastSeen: string;
  notes: string | null;
}

export interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  forwarded: number;
  last24h: number;
  last7d: number;
  last30d: number;
}

export const api = {
  getEmails: (status?: string) =>
    request<Email[]>(`/api/emails${status ? `?status=${status}` : ""}`),

  getEmail: (id: string) => request<Email>(`/api/emails/${id}`),

  approveEmail: (id: string) =>
    request<Email>(`/api/emails/${id}/approve`, { method: "POST" }),

  rejectEmail: (id: string) =>
    request<Email>(`/api/emails/${id}/reject`, { method: "POST" }),

  bulkAction: (ids: string[], action: "approve" | "reject") =>
    request<Email[]>("/api/emails/bulk", {
      method: "POST",
      body: JSON.stringify({ ids, action }),
    }),

  getSenders: (status?: string) =>
    request<Sender[]>(`/api/senders${status ? `?status=${status}` : ""}`),

  allowSender: (address: string) =>
    request(`/api/senders/${encodeURIComponent(address)}/allow`, {
      method: "POST",
    }),

  blockSender: (address: string) =>
    request(`/api/senders/${encodeURIComponent(address)}/block`, {
      method: "POST",
    }),

  resetSender: (address: string) =>
    request(`/api/senders/${encodeURIComponent(address)}`, {
      method: "DELETE",
    }),

  getSettings: () => request<Record<string, string>>("/api/settings"),

  updateSettings: (settings: Record<string, string>) =>
    request("/api/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    }),

  getStats: () => request<Stats>("/api/stats"),
};
