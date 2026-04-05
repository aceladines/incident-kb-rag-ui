export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApiError {
  detail: string;
  status: number;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
}
