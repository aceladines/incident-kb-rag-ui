"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [data, setData] = useState<PaginatedResponse<KbArticle> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getKbArticles(filters);
      setData(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch KB articles";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return { data, isLoading, error, refetch: fetchArticles };
}

export function useKbArticle(id: string) {
  const [data, setData] = useState<KbArticle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const result = await getKbArticle(id);
        setData(result);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch KB article";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { data, isLoading, error };
}

export function useKbArticleMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (formData: KbArticleFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createKbArticle(formData);
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create KB article";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(
    async (id: string, formData: KbArticleFormData) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await updateKbArticle(id, formData);
        return result;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to update KB article";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteKbArticle(id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete KB article";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, update, remove, isLoading, error };
}
