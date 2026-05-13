"use client";
// hooks/analytics/useAnalytics.ts
import { useState, useEffect, useCallback, useRef } from "react";

interface UseAnalyticsOptions<T> {
  fetcher: () => Promise<T>;
  /** Poll interval in ms. Default: 0 = no polling */
  pollingInterval?: number;
}

interface UseAnalyticsResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Reusable analytics data hook.
 * Supports optional polling for near-realtime updates without excessive re-renders.
 */
export function useAnalytics<T>({
  fetcher,
  pollingInterval = 0,
}: UseAnalyticsOptions<T>): UseAnalyticsResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    load();

    if (pollingInterval > 0) {
      intervalRef.current = setInterval(load, pollingInterval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [load, pollingInterval]);

  return { data, loading, error, refetch: load };
}
