import type {
  Rule,
  RuleFormData,
  RuleFilters,
  PaginatedResponse,
} from "@/lib/types";
import { apiClient, isMockMode } from "./client";
import { mockRules } from "@/lib/mock/rules";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

/** Simulates network latency in mock mode (300-500ms). */
function delay(): Promise<void> {
  const ms = 300 + Math.random() * 200;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Builds a query string from RuleFilters for the real API.
 * Array values are joined with commas.
 */
function buildQueryParams(filters?: RuleFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();

  if (filters.category?.length) params.set("category", filters.category.join(","));
  if (filters.is_enabled != null) params.set("is_enabled", String(filters.is_enabled));
  if (filters.search) params.set("search", filters.search);
  if (filters.page != null) params.set("page", String(filters.page));
  if (filters.page_size != null) params.set("page_size", String(filters.page_size));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Returns a paginated list of rules.
 * In mock mode, filters and paginates client-side against the mock array.
 */
export async function getRules(
  filters?: RuleFilters,
): Promise<PaginatedResponse<Rule>> {
  if (isMockMode()) {
    await delay();

    let items = [...mockRules];

    // Apply filters
    if (filters?.category?.length) {
      items = items.filter((r) => filters.category!.includes(r.category));
    }
    if (filters?.is_enabled != null) {
      items = items.filter((r) => r.is_enabled === filters.is_enabled);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      items = items.filter(
        (r) =>
          r.title.toLowerCase().includes(search) ||
          r.description.toLowerCase().includes(search),
      );
    }

    // Sort by priority ascending (lower number = higher priority = first)
    items.sort((a, b) => a.priority - b.priority);

    // Paginate
    const page = filters?.page ?? 1;
    const pageSize = filters?.page_size ?? DEFAULT_PAGE_SIZE;
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paginatedItems = items.slice(start, start + pageSize);

    return { items: paginatedItems, total, page, page_size: pageSize };
  }

  return apiClient.get<PaginatedResponse<Rule>>(
    `/api/rules${buildQueryParams(filters)}`,
  );
}

/** Returns a single rule by ID. */
export async function getRule(id: string): Promise<Rule> {
  if (isMockMode()) {
    await delay();
    const rule = mockRules.find((r) => r.id === id);
    if (!rule) {
      throw { detail: `Rule ${id} not found`, status: 404 };
    }
    return { ...rule };
  }

  return apiClient.get<Rule>(`/api/rules/${id}`);
}

/** Creates a new rule and returns the created record. */
export async function createRule(data: RuleFormData): Promise<Rule> {
  if (isMockMode()) {
    await delay();
    const now = new Date().toISOString();
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      ...data,
      created_by: "current-user",
      created_at: now,
      updated_at: now,
    };
    mockRules.push(newRule);
    return { ...newRule };
  }

  return apiClient.post<Rule>("/api/rules", data);
}

/** Updates an existing rule and returns the updated record. */
export async function updateRule(
  id: string,
  data: RuleFormData,
): Promise<Rule> {
  if (isMockMode()) {
    await delay();
    const index = mockRules.findIndex((r) => r.id === id);
    if (index === -1) {
      throw { detail: `Rule ${id} not found`, status: 404 };
    }
    const updated: Rule = {
      ...mockRules[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    mockRules[index] = updated;
    return { ...updated };
  }

  return apiClient.put<Rule>(`/api/rules/${id}`, data);
}

/** Deletes a rule by ID. */
export async function deleteRule(id: string): Promise<void> {
  if (isMockMode()) {
    await delay();
    const index = mockRules.findIndex((r) => r.id === id);
    if (index === -1) {
      throw { detail: `Rule ${id} not found`, status: 404 };
    }
    mockRules.splice(index, 1);
    return;
  }

  await apiClient.del<void>(`/api/rules/${id}`);
}

/**
 * Toggles a rule's enabled/disabled state without requiring the full form data.
 * In real API mode, sends a PUT with just the is_enabled field.
 */
export async function toggleRule(
  id: string,
  is_enabled: boolean,
): Promise<Rule> {
  if (isMockMode()) {
    await delay();
    const index = mockRules.findIndex((r) => r.id === id);
    if (index === -1) {
      throw { detail: `Rule ${id} not found`, status: 404 };
    }
    const updated: Rule = {
      ...mockRules[index],
      is_enabled,
      updated_at: new Date().toISOString(),
    };
    mockRules[index] = updated;
    return { ...updated };
  }

  return apiClient.put<Rule>(`/api/rules/${id}`, { is_enabled });
}
