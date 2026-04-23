"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  KbArticle,
  KbArticleFilters,
  KbArticleFormData,
  PaginatedResponse,
} from "@/lib/types";
import {
  getKbArticles,
  getKbArticle,
  createKbArticle,
  updateKbArticle,
  deleteKbArticle,
} from "@/lib/api/kb";

export function useKbArticles(filters?: KbArticleFilters) {
  const query = useQuery<PaginatedResponse<KbArticle>>({
    queryKey: ["kb", filters],
    queryFn: () => getKbArticles(filters),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch KB articles" : null,
    refetch: query.refetch,
  };
}

export function useKbArticle(id: string) {
  const query = useQuery<KbArticle>({
    queryKey: ["kb", id],
    queryFn: () => getKbArticle(id),
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error ? (query.error as Error).message ?? "Failed to fetch KB article" : null,
  };
}

export function useKbArticleMutations() {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["kb"] });

  const createMutation = useMutation({
    mutationFn: (data: KbArticleFormData) => createKbArticle(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: KbArticleFormData }) =>
      updateKbArticle(id, data),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => deleteKbArticle(id),
    onSuccess: invalidate,
  });

  return {
    create: (data: KbArticleFormData) => createMutation.mutateAsync(data),
    update: (id: string, data: KbArticleFormData) =>
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
