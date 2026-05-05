"use client";

import { useCallback, useState } from "react";
import type { AskQuery, AskResponse } from "@/lib/types";
import { askQuestion } from "@/lib/api/ask";
import { getErrorMessage } from "@/lib/api/client";

export function useAsk() {
  const [response, setResponse] = useState<AskResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = useCallback(async (query: AskQuery) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    try {
      const result = await askQuestion(query);
      setResponse(result);
      return result;
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to get response"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResponse(null);
    setError(null);
  }, []);

  return { response, isLoading, error, ask, clear };
}
