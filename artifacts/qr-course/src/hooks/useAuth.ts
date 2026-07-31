import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface AuthUser {
  id: number;
  username: string;
  email: string | null;
  displayName: string | null;
}

interface AuthState {
  authenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  refetch: () => void;
}

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

// In development, bypass Google login entirely — return a mock user so the
// login wall never appears while iterating locally.
const DEV_USER: AuthUser = {
  id: 0,
  username: "dev",
  email: "dev@localhost",
  displayName: "Dev User",
};

export function useAuth(): AuthState {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      if (import.meta.env.DEV) {
        return { authenticated: true as const, user: DEV_USER };
      }
      const res = await fetch(`${basePath}/api/auth/user`, {
        credentials: "include",
      });
      if (!res.ok) return { authenticated: false as const, user: null };
      return res.json() as Promise<{ authenticated: boolean; user: AuthUser | null }>;
    },
    staleTime: 30_000,
    retry: false,
  });

  return {
    authenticated: data?.authenticated ?? false,
    user: data?.user ?? null,
    isLoading,
    refetch,
  };
}

export function useLogout(): () => Promise<void> {
  const qc = useQueryClient();
  return async () => {
    await fetch(`${basePath}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    qc.setQueryData(["auth-user"], { authenticated: false, user: null });
    qc.invalidateQueries();
    window.location.href = basePath || "/";
  };
}
