"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Incident,
  IncidentFilters,
  IncidentFormData,
  PaginatedResponse,
} from "@/lib/types";
import {
  getIncidents,
  getIncident,
  createIncident,
  updateIncident,
  deleteIncident,
} from "@/lib/api/incidents";

export function useIncidents(filters?: IncidentFilters) {
  const query = useQuery<PaginatedResponse<Incident>>({
    queryKey: ["incidents", filters],
    queryFn: () => getIncidents(filters),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch incidents" : null,
    refetch: query.refetch,
  };
}

export function useIncident(id: string) {
  const query = useQuery<Incident>({
    queryKey: ["incidents", id],
    queryFn: () => getIncident(id),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch incident" : null,
  };
}

export function useIncidentMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["incidents"] });

  const createMutation = useMutation({
    mutationFn: (data: IncidentFormData) => createIncident(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: IncidentFormData }) =>
      updateIncident(id, data),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteIncident(id),
    onSuccess: invalidate,
  });

  return {
    create: (data: IncidentFormData) => createMutation.mutateAsync(data),
    update: (id: string, data: IncidentFormData) =>
      updateMutation.mutateAsync({ id, data }),
    remove: (id: string) => removeMutation.mutateAsync(id),
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending,
    error:
      createMutation.error?.message ??
      updateMutation.error?.message ??
      removeMutation.error?.message ??
      null,
  };
}
