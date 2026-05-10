"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "matchflight_watchlist";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWatchlist(new Set(JSON.parse(stored) as string[]));
      }
    } catch {}
  }, []);

  const persist = useCallback((next: Set<string>) => {
    setWatchlist(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {}
  }, []);

  const toggle = useCallback(
    (icao24: string) => {
      const next = new Set(watchlist);
      if (next.has(icao24)) {
        next.delete(icao24);
      } else {
        next.add(icao24);
      }
      persist(next);
    },
    [watchlist, persist]
  );

  const isWatched = useCallback(
    (icao24: string) => watchlist.has(icao24),
    [watchlist]
  );

  return { watchlist, toggle, isWatched };
}
