import type { QueryParams } from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Array<{ path: string; message: string }>;

  constructor(status: number, code: string, message: string, details?: Array<{ path: string; message: string }>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: QueryParams;
  signal?: AbortSignal;
  /** Auth endpoints must not trigger the refresh-and-retry flow. */
  skipRefresh?: boolean;
}

type RefreshResult = "refreshed" | "expired" | "unreachable";
let refreshInFlight: Promise<RefreshResult> | null = null;

/** One refresh at a time: parallel 401s share the same refresh request. */
function refreshSession(): Promise<RefreshResult> {
  if (!refreshInFlight) {
    refreshInFlight = fetch(`${BASE_URL}/auth/refresh`, { method: "POST", credentials: "include" })
      .then((res): RefreshResult => (res.ok ? "refreshed" : "expired"))
      .catch((): RefreshResult => "unreachable")
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function redirectToLogin() {
  if (typeof window === "undefined" || window.location.pathname.startsWith("/login")) return;
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.assign(`/login?next=${next}`);
}

function buildUrl(path: string, query?: QueryParams) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return `${BASE_URL}${path}${qs ? `?${qs}` : ""}`;
}

/**
 * Fetch wrapper for the API gateway: sends the httpOnly session cookies, unwraps
 * the `{ success, error }` envelope into `ApiError`, and transparently refreshes an
 * expired access token once before giving up and sending the user to /login.
 */
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, query, signal, skipRefresh } = options;
  const send = () =>
    fetch(buildUrl(path, query), {
      method,
      credentials: "include",
      headers: body !== undefined ? { "content-type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });

  let response: Response;
  try {
    response = await send();
    if (response.status === 401 && !skipRefresh) {
      const result = await refreshSession();
      if (result === "refreshed") response = await send();
      else if (result === "expired") redirectToLogin();
      else throw new ApiError(503, "NETWORK_ERROR", "Cannot reach the server. Check your connection and try again.");
    }
  } catch (err) {
    if (err instanceof ApiError || (err instanceof DOMException && err.name === "AbortError")) throw err;
    throw new ApiError(503, "NETWORK_ERROR", "Cannot reach the server. Check your connection and try again.");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const error = payload?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "HTTP_ERROR",
      error?.message ?? `Request failed (${response.status})`,
      error?.details,
    );
  }
  return payload as T;
}

/** Best human-readable message for a thrown value. */
export function errorMessage(error: unknown, fallback = "Something went wrong"): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
