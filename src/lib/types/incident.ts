export type IncidentStatus = "open" | "investigating" | "resolved" | "closed";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export interface Incident {
  id: string;
  title: string;
  description: string;
  impacted_services: string[];
  fix_details: string | null;
  responsible_team: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  created_by: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface IncidentFormData {
  title: string;
  description: string;
  impacted_services: string[];
  fix_details: string | null;
  responsible_team: string;
  severity: IncidentSeverity;
}

export interface IncidentFilters {
  status?: IncidentStatus[];
  severity?: IncidentSeverity[];
  services?: string[];
  team?: string;
  search?: string;
  page?: number;
  page_size?: number;
}
