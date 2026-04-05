import type { Service } from "@/lib/types";

export const mockServices: Service[] = [
  { id: "svc-001", name: "Authentication Service", description: "Handles user authentication and SSO" },
  { id: "svc-002", name: "Payment Gateway", description: "Processes payments and billing" },
  { id: "svc-003", name: "Email Service", description: "Transactional and notification emails" },
  { id: "svc-004", name: "API Gateway", description: "Main API gateway and rate limiting" },
  { id: "svc-005", name: "Database Cluster", description: "Primary PostgreSQL cluster" },
  { id: "svc-006", name: "CDN", description: "Content delivery network" },
  { id: "svc-007", name: "Search Service", description: "Elasticsearch-based search" },
  { id: "svc-008", name: "Notification Service", description: "Push notifications and alerts" },
  { id: "svc-009", name: "File Storage", description: "Blob storage for uploads" },
  { id: "svc-010", name: "Monitoring Stack", description: "Prometheus, Grafana, alerting" },
];
