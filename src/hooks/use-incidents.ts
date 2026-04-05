"use client";

import { useCallback, useEffect, useState } from "react";
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
  const [data, setData] = useState<PaginatedResponse<Incident> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getIncidents(filters);
      setData(result);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch incidents";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  return { data, isLoading, error, refetch: fetchIncidents };
}

export function useIncident(id: string) {
  const [data, setData] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const result = await getIncident(id);
        setData(result);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch incident";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [id]);

  return { data, isLoading, error };
}

export function useIncidentMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (formData: IncidentFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createIncident(formData);
      return result;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create incident";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const update = useCallback(
    async (id: string, formData: IncidentFormData) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await updateIncident(id, formData);
        return result;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to update incident";
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
      await deleteIncident(id);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete incident";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { create, update, remove, isLoading, error };
}
