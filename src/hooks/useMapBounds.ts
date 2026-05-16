"use client";

import { useCallback, useState } from "react";
import type { MapBounds } from "@/types/aircraft";

export function useMapBounds() {
  const [bounds, setBounds] = useState<MapBounds | null>(null);

  const updateBounds = useCallback((b: MapBounds) => {
    setBounds((prev) => {
      if (!prev) return b;
      // Trigger a new fetch only when the viewport has shifted enough
      const threshold = 0.2;
      if (
        Math.abs(b.lamin - prev.lamin) > threshold ||
        Math.abs(b.lomin - prev.lomin) > threshold ||
        Math.abs(b.lamax - prev.lamax) > threshold ||
        Math.abs(b.lomax - prev.lomax) > threshold
      ) {
        return b;
      }
      return prev;
    });
  }, []);

  return { bounds, updateBounds };
}
