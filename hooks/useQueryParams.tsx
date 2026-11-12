"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type ParamValue = string | number | undefined | null;

/**
 * Filters, sorting and pagination live in the URL: shareable, bookmarkable, and
 * the browser back button restores the previous list view. Changing any filter
 * resets to page 1.
 */
export function useQueryParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const params = useMemo(() => Object.fromEntries(searchParams.entries()) as Record<string, string>, [searchParams]);

  const setParams = useCallback(
    (updates: Record<string, ParamValue>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === null || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      if (!("page" in updates)) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const clearParams = useCallback(
    (keys: string[]) => setParams(Object.fromEntries(keys.map((k) => [k, undefined]))),
    [setParams],
  );

  return { params, setParams, clearParams };
}

/** Reads an integer param with a fallback. */
export function intParam(value: string | undefined, fallback: number) {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}
