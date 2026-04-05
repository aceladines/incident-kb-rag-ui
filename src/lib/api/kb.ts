import type {
  KbArticle,
  KbArticleFormData,
  KbArticleFilters,
  PaginatedResponse,
} from "@/lib/types";
import { apiClient, isMockMode } from "./client";
import { mockKbArticles } from "@/lib/mock/kb";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

/** Simulates network latency in mock mode (300-500ms). */
function delay(): Promise<void> {
  const ms = 300 + Math.random() * 200;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Builds a query string from KbArticleFilters for the real API.
 * Array values are joined with commas.
 */
function buildQueryParams(filters?: KbArticleFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();

  if (filters.category?.length) params.set("category", filters.category.join(","));
  if (filters.status?.length) params.set("status", filters.status.join(","));
  if (filters.tags?.length) params.set("tags", filters.tags.join(","));
  if (filters.services?.length) params.set("services", filters.services.join(","));
  if (filters.search) params.set("search", filters.search);
  if (filters.page != null) params.set("page", String(filters.page));
  if (filters.page_size != null) params.set("page_size", String(filters.page_size));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Returns a paginated list of KB articles.
 * In mock mode, filters and paginates client-side against the mock array.
 */
export async function getKbArticles(
  filters?: KbArticleFilters,
): Promise<PaginatedResponse<KbArticle>> {
  if (isMockMode()) {
    await delay();

    let items = [...mockKbArticles];

    // Apply filters
    if (filters?.category?.length) {
      items = items.filter((a) => filters.category!.includes(a.category));
    }
    if (filters?.status?.length) {
      items = items.filter((a) => filters.status!.includes(a.status));
    }
    if (filters?.tags?.length) {
      items = items.filter((a) =>
        a.tags.some((t) => filters.tags!.includes(t)),
      );
    }
    if (filters?.services?.length) {
      items = items.filter((a) =>
        a.related_services.some((s) => filters.services!.includes(s)),
      );
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      items = items.filter(
        (a) =>
          a.title.toLowerCase().includes(search) ||
          a.summary.toLowerCase().includes(search) ||
          a.content.toLowerCase().includes(search) ||
          a.tags.some((t) => t.toLowerCase().includes(search)),
      );
    }

    // Sort by updated_at descending (most recently updated first)
    items.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );

    // Paginate
    const page = filters?.page ?? 1;
    const pageSize = filters?.page_size ?? DEFAULT_PAGE_SIZE;
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paginatedItems = items.slice(start, start + pageSize);

    return { items: paginatedItems, total, page, page_size: pageSize };
  }

  return apiClient.get<PaginatedResponse<KbArticle>>(
    `/api/kb${buildQueryParams(filters)}`,
  );
}

/** Returns a single KB article by ID. */
export async function getKbArticle(id: string): Promise<KbArticle> {
  if (isMockMode()) {
    await delay();
    const article = mockKbArticles.find((a) => a.id === id);
    if (!article) {
      throw { detail: `KB article ${id} not found`, status: 404 };
    }
    return { ...article };
  }

  return apiClient.get<KbArticle>(`/api/kb/${id}`);
}

/** Creates a new KB article and returns the created record. */
export async function createKbArticle(
  data: KbArticleFormData,
): Promise<KbArticle> {
  if (isMockMode()) {
    await delay();
    const now = new Date().toISOString();
    const newArticle: KbArticle = {
      id: `kb-${Date.now()}`,
      ...data,
      created_by: "current-user",
      created_at: now,
      updated_at: now,
      published_at: data.status === "published" ? now : null,
    };
    mockKbArticles.unshift(newArticle);
    return { ...newArticle };
  }

  return apiClient.post<KbArticle>("/api/kb", data);
}

/** Updates an existing KB article and returns the updated record. */
export async function updateKbArticle(
  id: string,
  data: KbArticleFormData,
): Promise<KbArticle> {
  if (isMockMode()) {
    await delay();
    const index = mockKbArticles.findIndex((a) => a.id === id);
    if (index === -1) {
      throw { detail: `KB article ${id} not found`, status: 404 };
    }
    const existing = mockKbArticles[index];
    const now = new Date().toISOString();
    const updated: KbArticle = {
      ...existing,
      ...data,
      updated_at: now,
      // Set published_at if transitioning to published for the first time
      published_at:
        data.status === "published" && !existing.published_at
          ? now
          : existing.published_at,
    };
    mockKbArticles[index] = updated;
    return { ...updated };
  }

  return apiClient.put<KbArticle>(`/api/kb/${id}`, data);
}

/** Deletes a KB article by ID. */
export async function deleteKbArticle(id: string): Promise<void> {
  if (isMockMode()) {
    await delay();
    const index = mockKbArticles.findIndex((a) => a.id === id);
    if (index === -1) {
      throw { detail: `KB article ${id} not found`, status: 404 };
    }
    mockKbArticles.splice(index, 1);
    return;
  }

  await apiClient.del<void>(`/api/kb/${id}`);
}
