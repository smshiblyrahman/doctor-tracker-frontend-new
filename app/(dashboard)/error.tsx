"use client";

import { ErrorState } from "@/components/shared/ErrorState";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return <ErrorState error={error} onRetry={reset} title="This page failed to load" />;
}
