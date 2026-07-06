import { backendBaseUrl } from "../constants/apiUrl";
import { isSeedBlogSlug } from "./description";

const API_URL = (backendBaseUrl || "").replace(/\/$/, "");
const REVALIDATE_SECONDS = 3600;

type FetchOptions = {
  revalidate?: number;
};

async function serverFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      next: { revalidate: options.revalidate ?? REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function fetchProperties() {
  const payload = await serverFetch<{
    success?: boolean;
    properties?: unknown[];
    data?: unknown[];
  }>("/getAllProperties");
  if (!payload) return [];
  if (payload.success && Array.isArray(payload.properties)) return payload.properties;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}

export async function fetchPropertyById(id: string) {
  const properties = await fetchProperties();
  return (properties as { _id?: string }[]).find((p) => p._id === id) ?? null;
}

export async function fetchLoans() {
  const payload = await serverFetch<{ success?: boolean; data?: unknown[]; loans?: unknown[] }>(
    "/getAllLoans"
  );
  if (!payload) return [];
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.loans)) return payload.loans;
  return [];
}

export async function fetchLoanById(id: string) {
  const loans = await fetchLoans();
  return (loans as { _id?: string }[]).find((l) => l._id === id) ?? null;
}

export async function fetchInstallmentsPage(page = 1, limit = 100) {
  const payload = await serverFetch<{
    success?: boolean;
    data?: unknown[];
    pagination?: { totalPages?: number; total?: number };
  }>(`/getAllInstallments?page=${page}&limit=${limit}`);
  if (!payload) return { items: [], totalPages: 1, total: 0 };
  const data = payload.data ?? [];
  const items = Array.isArray(data) ? data : [];
  return {
    items,
    totalPages: Number(payload.pagination?.totalPages || 1),
    total: Number(payload.pagination?.total || items.length),
  };
}

export async function fetchAllInstallments() {
  const first = await fetchInstallmentsPage(1, 500);
  let all = [...first.items];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await fetchInstallmentsPage(page, 500);
    all = all.concat(next.items);
  }
  return all;
}

export async function fetchInstallmentById(id: string) {
  const payload = await serverFetch<{ success?: boolean; data?: unknown }>(
    `/getInstallment/${encodeURIComponent(id)}`
  );
  if (!payload) return null;
  return (payload.data ?? payload) as Record<string, unknown> | null;
}

export async function fetchInsurancePlans() {
  const payload = await serverFetch<{ success?: boolean; data?: unknown[] }>(
    "/getAllInsurancePlansPublic?limit=1000"
  );
  if (!payload?.success || !Array.isArray(payload.data)) return [];
  return payload.data;
}

export async function fetchInsuranceById(id: string) {
  const payload = await serverFetch<{ success?: boolean; data?: unknown }>(
    `/getInsurancePlan/${encodeURIComponent(id)}`
  );
  if (payload?.success && payload.data) return payload.data;
  const plans = await fetchInsurancePlans();
  return (plans as { _id?: string }[]).find((p) => p._id === id) ?? null;
}

export async function fetchPublishedBlogs() {
  const payload = await serverFetch<{
    success?: boolean;
    data?: { slug?: string; updatedAt?: string; createdAt?: string }[];
  }>("/getPublishedBlogs?limit=500&page=1");
  if (!payload?.success || !Array.isArray(payload.data)) return [];
  return payload.data.filter((b) => b.slug && !isSeedBlogSlug(b.slug));
}

export async function fetchBlogBySlug(slug: string) {
  const encoded = encodeURIComponent(slug);
  const payload = await serverFetch<{ success?: boolean; data?: Record<string, unknown> }>(
    `/getBlogBySlug/${encoded}`
  );
  if (!payload?.success || !payload.data) return null;
  return payload.data;
}

export { REVALIDATE_SECONDS };
