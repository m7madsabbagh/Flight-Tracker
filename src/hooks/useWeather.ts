"use client";

import { useEffect, useState } from "react";
import type { WeatherResponse } from "@/types/weather";

export function useWeather(lat: number | null, lon: number | null) {
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat == null || lon == null) {
      setWeather(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/weather?lat=${lat}&lon=${lon}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: WeatherResponse) => {
        if (!cancelled) setWeather(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon]);

  return { weather, loading, error };
}
