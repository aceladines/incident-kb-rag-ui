"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  TechSpec,
  TechSpecFilters,
  TechSpecFormData,
  PaginatedResponse,
} from "@/lib/types";
import {
  getTechSpecs,
  getTechSpec,
  createTechSpec,
  updateTechSpec,
  deleteTechSpec,
} from "@/lib/api/tech-specs";

export function useTechSpecs(filters?: TechSpecFilters) {
  const query = useQuery<PaginatedResponse<TechSpec>>({
    queryKey: ["tech-specs", filters],
    queryFn: () => getTechSpecs(filters),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch tech specs" : null,
    refetch: query.refetch,
  };
}

export function useTechSpec(id: string) {
  const query = useQuery<TechSpec>({
    queryKey: ["tech-specs", id],
    queryFn: () => getTechSpec(id),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch tech spec" : null,
  };
}

export function useTechSpecMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["tech-specs"] });

  const createMutation = useMutation({
    mutationFn: (data: TechSpecFormData) => createTechSpec(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TechSpecFormData }) =>
      updateTechSpec(id, data),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteTechSpec(id),
    onSuccess: invalidate,
  });

  return {
    create: (data: TechSpecFormData) => createMutation.mutateAsync(data),
    update: (id: string, data: TechSpecFormData) =>
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
