"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { ApiResponse, User } from "@/lib/types";
import type { LoginValues } from "@/lib/validators/auth";

export const sessionKey = ["session"] as const;

/** Current admin user; cached for the session and shared by sidebar + header. */
export function useSession() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: ({ signal }) => api<ApiResponse<{ user: User }>>("/auth/me", { signal }).then((r) => r.data.user),
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: LoginValues) =>
      api<ApiResponse<{ user: User }>>("/auth/login", { method: "POST", body: values, skipRefresh: true }),
    onSuccess: (res) => {
      queryClient.clear();
      queryClient.setQueryData(sessionKey, res.data.user);
    },
  });
}

/**
 * Cancels in-flight queries first (otherwise they 401 once the cookies are gone and
 * trigger the "session expired" redirect), then hard-navigates so no cached data
 * from the signed-out session survives in memory.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await queryClient.cancelQueries();
      return api("/auth/logout", { method: "POST", skipRefresh: true });
    },
    // No queryClient.clear(): mounted observers would immediately refetch (and 401).
    // The hard navigation below discards the whole in-memory cache anyway.
    onSettled: () => window.location.replace("/login"),
    onError: () => toast.error("Sign-out may not have completed on the server"),
  });
}

/** Only allow same-site relative redirects after login (no open redirects). */
export function safeNextPath(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}
