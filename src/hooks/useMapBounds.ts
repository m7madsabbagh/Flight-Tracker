"use client";

import { useCallback, useState } from "react";
import type { MapBounds } from "@/types/aircraft";

export function useMapBounds() {
  const [bounds, setBounds] = useState<MapBounds | null>(null);

  const updateBounds = useCallback((b: MapBounds) => {
    setBounds((prev) => {
      // Only update if the change is significant enough to warrant a new fetch
      if (!prev) return b;
      const delta = 0.5;
      if (
        Math.abs(b.lamin - prev.lamin) > delta ||
        Math.abs(b.lomin - prev.lomin) > delta ||
        Math.abs(b.lamax - prev.lamax) > delta ||
        Math.abs(b.lomax - prev.lomax) > delta
      ) {
        return b;
      }
      return prev;
    });
  }, []);

  return { bounds, updateBounds };
}
