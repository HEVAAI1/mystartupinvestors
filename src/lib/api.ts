// Auth
export async function signInWithGoogle() {
  const res = await fetch("/api/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "google", redirectTo: `${window.location.origin}/auth/callback` }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
  return data;
}

export async function signOut() {
  const res = await fetch("/api/auth/signout", { method: "POST" });
  return res.json();
}

export async function getUser() {
  const res = await fetch("/api/auth/user");
  return res.json();
}

export async function getSession() {
  const res = await fetch("/api/auth/session");
  return res.json();
}

// Investors
export async function getInvestors(params: {
  page?: number; pageSize?: number; search?: string;
  location?: string; industry?: string; showViewed?: boolean;
}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) query.set(k, String(v)); });
  const res = await fetch(`/api/investors?${query}`);
  return res.json();
}

export async function unlockInvestor(id: number) {
  const res = await fetch(`/api/investors/${id}/unlock`, { method: "POST" });
  return res.json();
}

export async function getFilterOptions() {
  const res = await fetch("/api/investors/filters");
  return res.json();
}

export async function getInvestorAccess(userId: string, investorId: string) {
  const res = await fetch(`/api/investors/access?userId=${userId}&investorId=${investorId}`);
  return res.json();
}

// User
export async function getUserCredits() {
  const res = await fetch("/api/user/credits");
  return res.json();
}

export async function getStartupStatus() {
  const res = await fetch("/api/user/startup-status");
  return res.json();
}

// Startups
export async function createStartup(data: Record<string, unknown>, updateUserFlag = false) {
  const res = await fetch("/api/startups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data, updateUserFlag }),
  });
  return res.json();
}

export async function getMyStartup() {
  const res = await fetch("/api/startups/my");
  return res.json();
}

export async function updateMyStartup(field: string, value: string, id: number) {
  const res = await fetch("/api/startups/my", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ field, value, id }),
  });
  return res.json();
}

export async function uploadDeck(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/startups/upload-deck", {
    method: "POST",
    body: formData,
  });
  return res.json();
}

// Admin
export async function getAdminUsers(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`/api/admin/users${query}`);
  return res.json();
}

export async function updateUser(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getAdminInvestors(search?: string, page: number = 1) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  params.set("page", String(page));
  const res = await fetch(`/api/admin/investors?${params.toString()}`);
  return res.json();
}

export async function createInvestor(data: Record<string, unknown>) {
  const res = await fetch("/api/admin/investors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateInvestor(id: string, data: Record<string, unknown>) {
  const res = await fetch(`/api/admin/investors/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteInvestor(id: string) {
  const res = await fetch(`/api/admin/investors/${id}`, { method: "DELETE" });
  return res.json();
}

export async function getAdminStartups(search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`/api/admin/startups${query}`);
  return res.json();
}

export async function getAdminAffiliates() {
  const res = await fetch("/api/admin/affiliates");
  return res.json();
}

export async function getAdminWithdrawals(status?: string) {
  const query = status ? `?status=${status}` : "";
  const res = await fetch(`/api/admin/withdrawals${query}`);
  return res.json();
}

export async function updateWithdrawal(id: string, status: string) {
  const res = await fetch(`/api/admin/withdrawals/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function getAdminDashboard() {
  const res = await fetch("/api/admin/dashboard");
  return res.json();
}

export async function getAdminVisualization() {
  const res = await fetch("/api/admin/dashboard/visualization");
  return res.json();
}

export async function getExportData() {
  const res = await fetch("/api/admin/excel");
  return res.json();
}

export async function getTransaction(paymentId: string) {
  const res = await fetch(`/api/transactions/${paymentId}`);
  return res.json();
}
