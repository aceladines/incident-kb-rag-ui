export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: "admin" | "agent";
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
