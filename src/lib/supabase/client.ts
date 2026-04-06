import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function isConfigured(): boolean {
  return !!(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("http")
  );
}

export function createClient() {
  if (!isConfigured()) {
    const mockUser = {
      id: "mock-user-id",
      email: "admin@example.com",
      app_metadata: { role: "admin" as const },
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    };
    const mockSession = { user: mockUser, access_token: "", refresh_token: "", expires_in: 3600, token_type: "bearer" };

    return {
      auth: {
        getUser: async () => ({ data: { user: mockUser }, error: null }),
        getSession: async () => ({ data: { session: mockSession }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error("Supabase not configured") }),
        signUp: async () => ({ data: { user: null, session: null }, error: new Error("Supabase not configured") }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: (_event: string, callback: (event: string, session: typeof mockSession | null) => void) => {
          callback("INITIAL_SESSION", mockSession);
          return {
            data: { subscription: { unsubscribe: () => {} } },
          };
        },
      },
    } as ReturnType<typeof createBrowserClient>;
  }

  return createBrowserClient(supabaseUrl!, supabaseAnonKey!);
}

export { isConfigured as isSupabaseConfigured };
