"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { AuthUser } from "@/lib/types/auth";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

function mapUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email ?? "",
    full_name: user.user_metadata?.full_name ?? "",
    avatar_url: user.user_metadata?.avatar_url,
    role: (user.app_metadata?.role as AuthUser["role"]) ?? "agent",
  };
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setState({
        user: mapUser(user),
        isLoading: false,
        isAuthenticated: !!user,
      });
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: { user: User | null } | null) => {
      setState({
        user: mapUser(session?.user ?? null),
        isLoading: false,
        isAuthenticated: !!session?.user,
      });
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    },
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isAdmin = state.user?.role === "admin";

  return {
    ...state,
    isAdmin,
    signIn,
    signUp,
    signOut,
  };
}
