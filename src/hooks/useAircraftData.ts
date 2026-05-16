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

  const doFetch = useCallback(async () => {
    if (!bounds) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);

    const params = new URLSearchParams({
      lamin: bounds.lamin.toFixed(4),
      lomin: bounds.lomin.toFixed(4),
      lamax: bounds.lamax.toFixed(4),
      lomax: bounds.lomax.toFixed(4),
    });

    try {
      const res = await fetch(`/api/aircraft?${params}`, {
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          (body as { error?: string }).error ?? `OpenSky returned ${res.status}`
        );
      }

      const data = await res.json();
      const parsed: Aircraft[] = (data.states ?? []).map(parseStateVector);
      setAircraft(parsed);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Unknown error";
      // Suppress "Failed to fetch" noise — show a friendlier message
      setError(
        msg.includes("Failed to fetch") || msg.includes("timeout")
          ? "OpenSky unavailable — retrying…"
          : msg
      );
    } finally {
      setLoading(false);
    }
  }, [bounds]);

  useEffect(() => {
    doFetch();
    const id = setInterval(doFetch, intervalMs);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [doFetch, intervalMs]);

  return { aircraft, loading, error, lastUpdated, refresh: doFetch };
}
