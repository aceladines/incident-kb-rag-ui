import type { Service } from "@/lib/types";
import { apiClient, isMockMode } from "./client";
import { mockServices } from "@/lib/mock/services";

/** Simulates network latency in mock mode (300-500ms). */
function delay(): Promise<void> {
  const ms = 300 + Math.random() * 200;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Returns the full list of services from the service catalog. */
export async function getServices(): Promise<Service[]> {
  if (isMockMode()) {
    await delay();
    return [...mockServices];
  }

  return apiClient.get<Service[]>("/api/services");
}
