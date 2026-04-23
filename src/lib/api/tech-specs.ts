import type {
  TechSpec,
  TechSpecFormData,
  TechSpecFilters,
  PaginatedResponse,
} from "@/lib/types";
import { apiClient, isMockMode } from "./client";
import { mockTechSpecs } from "@/lib/mock/tech-specs";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

/** Simulates network latency in mock mode (300-500ms). */
function delay(): Promise<void> {
  const ms = 300 + Math.random() * 200;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Builds a query string from TechSpecFilters for the real API.
 * Array values are joined with commas.
 */
function buildQueryParams(filters?: TechSpecFilters): string {
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
 * Returns a paginated list of tech specs.
 * In mock mode, filters and paginates client-side against the mock array.
 */
export async function getTechSpecs(
  filters?: TechSpecFilters,
): Promise<PaginatedResponse<TechSpec>> {
  if (isMockMode()) {
    await delay();

    let items = [...mockTechSpecs];

    // Apply filters
    if (filters?.category?.length) {
      items = items.filter((s) => filters.category!.includes(s.category));
    }
    if (filters?.status?.length) {
      items = items.filter((s) => filters.status!.includes(s.status));
    }
    if (filters?.tags?.length) {
      items = items.filter((s) =>
        s.tags.some((t) => filters.tags!.includes(t)),
      );
    }
    if (filters?.services?.length) {
      items = items.filter((s) =>
        s.related_services.some((svc) => filters.services!.includes(svc)),
      );
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      items = items.filter(
        (s) =>
          s.title.toLowerCase().includes(search) ||
          s.summary.toLowerCase().includes(search) ||
          s.content.toLowerCase().includes(search) ||
          s.tags.some((t) => t.toLowerCase().includes(search)),
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

  return apiClient.get<PaginatedResponse<TechSpec>>(
    `/api/tech-specs${buildQueryParams(filters)}`,
  );
}

/** Returns a single tech spec by ID. */
export async function getTechSpec(id: string): Promise<TechSpec> {
  if (isMockMode()) {
    await delay();
    const spec = mockTechSpecs.find((s) => s.id === id);
    if (!spec) {
      throw { detail: `Tech spec ${id} not found`, status: 404 };
    }
    return { ...spec };
  }

  return apiClient.get<TechSpec>(`/api/tech-specs/${id}`);
}

/** Creates a new tech spec and returns the created record. */
export async function createTechSpec(
  data: TechSpecFormData,
): Promise<TechSpec> {
  if (isMockMode()) {
    await delay();
    const now = new Date().toISOString();
    const newSpec: TechSpec = {
      id: `ts-${Date.now()}`,
      ...data,
      created_by: "current-user",
      created_at: now,
      updated_at: now,
      published_at: data.status === "published" ? now : null,
    };
    mockTechSpecs.unshift(newSpec);
    return { ...newSpec };
  }

  return apiClient.post<TechSpec>("/api/tech-specs", data);
}

/** Updates an existing tech spec and returns the updated record. */
export async function updateTechSpec(
  id: string,
  data: TechSpecFormData,
): Promise<TechSpec> {
  if (isMockMode()) {
    await delay();
    const index = mockTechSpecs.findIndex((s) => s.id === id);
    if (index === -1) {
      throw { detail: `Tech spec ${id} not found`, status: 404 };
    }
    const existing = mockTechSpecs[index];
    const now = new Date().toISOString();
    const updated: TechSpec = {
      ...existing,
      ...data,
      updated_at: now,
      published_at:
        data.status === "published" && !existing.published_at
          ? now
          : existing.published_at,
    };
    mockTechSpecs[index] = updated;
    return { ...updated };
  }

  return apiClient.put<TechSpec>(`/api/tech-specs/${id}`, data);
}

/** Deletes a tech spec by ID. */
export async function deleteTechSpec(id: string): Promise<void> {
  if (isMockMode()) {
    await delay();
    const index = mockTechSpecs.findIndex((s) => s.id === id);
    if (index === -1) {
      throw { detail: `Tech spec ${id} not found`, status: 404 };
    }
    mockTechSpecs.splice(index, 1);
    return;
  }

  await apiClient.del<void>(`/api/tech-specs/${id}`);
}
