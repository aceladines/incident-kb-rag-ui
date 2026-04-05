import type { AskQuery, AskResponse } from "@/lib/types";
import { apiClient, isMockMode } from "./client";
import { getMockAskResponse } from "@/lib/mock/ask";

/** Simulates network latency in mock mode (300-500ms). */
function delay(): Promise<void> {
  const ms = 300 + Math.random() * 200;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Sends a natural-language query to the RAG pipeline and returns
 * an AI-generated answer along with the source references used.
 *
 * In mock mode, performs simple keyword matching against mock incidents
 * and KB articles to simulate retrieval results.
 */
export async function askQuestion(query: AskQuery): Promise<AskResponse> {
  if (isMockMode()) {
    await delay();
    return getMockAskResponse(query.query);
  }

  return apiClient.post<AskResponse>("/api/ask", query);
}
