"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [data, setData] = useState<PaginatedResponse<TechSpec> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getTechSpecs(filters);
      setData(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch tech specs";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSpecs();
  }, [fetchSpecs]);

  return { data, isLoading, error, refetch: fetchSpecs };
}

export function useTechSpec(id: string) {
  const [data, setData] = useState<TechSpec | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const result = await getTechSpec(id);
        setData(result);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch tech spec";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { data, isLoading, error };
}

export function useTechSpecMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (formData: TechSpecFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createTechSpec(formData);
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create tech spec";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(
    async (id: string, formData: TechSpecFormData) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await updateTechSpec(id, formData);
        return result;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to update tech spec";
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
      await deleteTechSpec(id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete tech spec";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, update, remove, isLoading, error };
}
