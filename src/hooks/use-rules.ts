"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [data, setData] = useState<PaginatedResponse<Rule> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getRules(filters);
      setData(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch rules";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return { data, isLoading, error, refetch: fetchRules };
}

export function useRule(id: string) {
  const [data, setData] = useState<Rule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const result = await getRule(id);
        setData(result);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch rule";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { data, isLoading, error };
}

export function useRuleMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (formData: RuleFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createRule(formData);
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create rule";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, formData: RuleFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateRule(id, formData);
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update rule";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteRule(id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete rule";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggle = useCallback(async (id: string, is_enabled: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await toggleRule(id, is_enabled);
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to toggle rule";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, update, remove, toggle, isLoading, error };
}
