import type { Team } from "@/lib/types";
import { apiClient, isMockMode } from "./client";
import { mockTeams } from "@/lib/mock/teams";

/** Simulates network latency in mock mode (300-500ms). */
function delay(): Promise<void> {
  const ms = 300 + Math.random() * 200;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Returns the full list of teams/groups. */
export async function getTeams(): Promise<Team[]> {
  if (isMockMode()) {
    await delay();
    return [...mockTeams];
  }

  return apiClient.get<Team[]>("/api/teams");
}
