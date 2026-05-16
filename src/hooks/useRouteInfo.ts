"use client";

import { useEffect, useState } from "react";

interface RouteInfo {
  departure: string | null;
  arrival: string | null;
}

export function useRouteInfo(icao24: string | null) {
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!icao24) {
      setRoute(null);
      return;
    }

    const ctrl = new AbortController();
    setLoading(true);

    fetch(`/api/routes?icao24=${icao24}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: RouteInfo) => setRoute(data))
      .catch((err: Error) => {
        if (err.name !== "AbortError") setRoute(null);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });

    return () => ctrl.abort();
  }, [icao24]);

  return { route, loading };
}
