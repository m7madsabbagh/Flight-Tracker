"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Aircraft, MapBounds } from "@/types/aircraft";
import { parseStateVector } from "@/utils/aircraft";

interface UseAircraftDataReturn {
  aircraft: Aircraft[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useAircraftData(
  bounds: MapBounds | null,
  intervalMs: number = 10000
): UseAircraftDataReturn {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetch = useCallback(async () => {
    if (!bounds) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      lamin: bounds.lamin.toFixed(4),
      lomin: bounds.lomin.toFixed(4),
      lamax: bounds.lamax.toFixed(4),
      lomax: bounds.lomax.toFixed(4),
    });

    try {
      const res = await window.fetch(`/api/aircraft?${params}`, {
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data = await res.json();
      const parsed: Aircraft[] = (data.states ?? []).map(parseStateVector);
      setAircraft(parsed);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [bounds]);

  // Initial fetch + interval
  useEffect(() => {
    fetch();
    const id = setInterval(fetch, intervalMs);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [fetch, intervalMs]);

  return { aircraft, loading, error, lastUpdated, refresh: fetch };
}
