"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Rule, RuleFilters, RuleFormData, PaginatedResponse } from "@/lib/types";
import {
  getRules,
  getRule,
  createRule,
  updateRule,
  deleteRule,
  toggleRule,
} from "@/lib/api/rules";

export function useRules(filters?: RuleFilters) {
  const query = useQuery<PaginatedResponse<Rule>>({
    queryKey: ["rules", filters],
    queryFn: () => getRules(filters),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch rules" : null,
    refetch: query.refetch,
  };
}

export function useRule(id: string) {
  const query = useQuery<Rule>({
    queryKey: ["rules", id],
    queryFn: () => getRule(id),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch rule" : null,
  };
}

export function useRuleMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["rules"] });

  const createMutation = useMutation({
    mutationFn: (data: RuleFormData) => createRule(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RuleFormData }) =>
      updateRule(id, data),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteRule(id),
    onSuccess: invalidate,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_enabled }: { id: string; is_enabled: boolean }) =>
      toggleRule(id, is_enabled),
    onSuccess: invalidate,
  });

  return {
    create: (data: RuleFormData) => createMutation.mutateAsync(data),
    update: (id: string, data: RuleFormData) =>
      updateMutation.mutateAsync({ id, data }),
    remove: (id: string) => removeMutation.mutateAsync(id),
    toggle: (id: string, is_enabled: boolean) =>
      toggleMutation.mutateAsync({ id, is_enabled }),
    isLoading:
      createMutation.isPending ||
      updateMutation.isPending ||
      removeMutation.isPending ||
      toggleMutation.isPending,
    error:
      createMutation.error?.message ??
      updateMutation.error?.message ??
      removeMutation.error?.message ??
      toggleMutation.error?.message ??
      null,
  };
}
