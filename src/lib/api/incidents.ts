import type {
  Incident,
  IncidentFormData,
  IncidentFilters,
  ProcessIncidentRequest,
  ProcessIncidentResponse,
  PaginatedResponse,
} from "@/lib/types";
import { apiClient, isMockMode } from "./client";
import { mockIncidents } from "@/lib/mock/incidents";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

/** Simulates network latency in mock mode (300-500ms). */
function delay(): Promise<void> {
  const ms = 300 + Math.random() * 200;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Builds a query string from IncidentFilters for the real API.
 * Array values are joined with commas.
 */
function buildQueryParams(filters?: IncidentFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();

  if (filters.status?.length) params.set("status", filters.status.join(","));
  if (filters.severity?.length) params.set("severity", filters.severity.join(","));
  if (filters.services?.length) params.set("services", filters.services.join(","));
  if (filters.team) params.set("team", filters.team);
  if (filters.search) params.set("search", filters.search);
  if (filters.page != null) params.set("page", String(filters.page));
  if (filters.page_size != null) params.set("page_size", String(filters.page_size));

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Returns a paginated list of incidents.
 * In mock mode, filters and paginates client-side against the mock array.
 */
export async function getIncidents(
  filters?: IncidentFilters,
): Promise<PaginatedResponse<Incident>> {
  if (isMockMode()) {
    await delay();

    let items = [...mockIncidents];

    // Apply filters
    if (filters?.status?.length) {
      items = items.filter((i) => filters.status!.includes(i.status));
    }
    if (filters?.severity?.length) {
      items = items.filter((i) => filters.severity!.includes(i.severity));
    }
    if (filters?.services?.length) {
      items = items.filter((i) =>
        i.impacted_services.some((s) => filters.services!.includes(s)),
      );
    }
    if (filters?.team) {
      items = items.filter((i) => i.responsible_team === filters.team);
    }
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(search) ||
          i.description.toLowerCase().includes(search),
      );
    }

    // Sort by created_at descending (newest first)
    items.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    // Paginate
    const page = filters?.page ?? 1;
    const pageSize = filters?.page_size ?? DEFAULT_PAGE_SIZE;
    const total = items.length;
    const start = (page - 1) * pageSize;
    const paginatedItems = items.slice(start, start + pageSize);

    return { items: paginatedItems, total, page, page_size: pageSize };
  }

  return apiClient.get<PaginatedResponse<Incident>>(
    `/api/incidents${buildQueryParams(filters)}`,
  );
}

/** Returns a single incident by ID. */
export async function getIncident(id: string): Promise<Incident> {
  if (isMockMode()) {
    await delay();
    const incident = mockIncidents.find((i) => i.id === id);
    if (!incident) {
      throw { detail: `Incident ${id} not found`, status: 404 };
    }
    return { ...incident };
  }

  return apiClient.get<Incident>(`/api/incidents/${id}`);
}

/** Creates a new incident and returns the created record. */
export async function createIncident(
  data: IncidentFormData,
): Promise<Incident> {
  if (isMockMode()) {
    await delay();
    const now = new Date().toISOString();
    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      ...data,
      status: "open",
      created_by: "current-user",
      created_at: now,
      updated_at: now,
      resolved_at: null,
    };
    mockIncidents.unshift(newIncident);
    return { ...newIncident };
  }

  return apiClient.post<Incident>("/api/incidents", data);
}

/** Updates an existing incident and returns the updated record. */
export async function updateIncident(
  id: string,
  data: IncidentFormData,
): Promise<Incident> {
  if (isMockMode()) {
    await delay();
    const index = mockIncidents.findIndex((i) => i.id === id);
    if (index === -1) {
      throw { detail: `Incident ${id} not found`, status: 404 };
    }
    const updated: Incident = {
      ...mockIncidents[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    mockIncidents[index] = updated;
    return { ...updated };
  }

  return apiClient.put<Incident>(`/api/incidents/${id}`, data);
}

/** Deletes an incident by ID. */
export async function deleteIncident(id: string): Promise<void> {
  if (isMockMode()) {
    await delay();
    const index = mockIncidents.findIndex((i) => i.id === id);
    if (index === -1) {
      throw { detail: `Incident ${id} not found`, status: 404 };
    }
    mockIncidents.splice(index, 1);
    return;
  }

  await apiClient.del<void>(`/api/incidents/${id}`);
}

/**
 * Submits an error message to the AI agent for automated processing
 * (RCA, fix application, validation).
 *
 * Returns `status: "duplicate"` with the existing `task_id` when
 * the same message was submitted within the 60-second dedup window.
 */
export async function processIncident(
  data: ProcessIncidentRequest,
): Promise<ProcessIncidentResponse> {
  if (isMockMode()) {
    await delay();
    return {
      task_id: `task-${Date.now()}`,
      status: "accepted",
    };
  }

  return apiClient.post<ProcessIncidentResponse>("/process_incident", data);
}
