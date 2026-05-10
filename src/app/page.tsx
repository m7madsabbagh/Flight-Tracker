"use client";

import { useCallback, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Aircraft, AircraftFilters, MapBounds } from "@/types/aircraft";
import { useAircraftData } from "@/hooks/useAircraftData";
import { useMapBounds } from "@/hooks/useMapBounds";
import { useWatchlist } from "@/hooks/useWatchlist";
import { applyFilters } from "@/utils/aircraft";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatsBar } from "@/components/ui/StatsBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Dynamically import map to avoid SSR issues with maplibre-gl
const FlightMap = dynamic(
  () => import("@/components/map/FlightMap").then((m) => m.FlightMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-aviation-bg">
        <LoadingSpinner size="lg" label="Loading map…" />
      </div>
    ),
  }
);

const DEFAULT_FILTERS: AircraftFilters = {
  searchQuery: "",
  altitudeMin: null,
  altitudeMax: null,
  speedMin: null,
  speedMax: null,
  onGroundOnly: false,
  inAirOnly: false,
  country: "",
};

const REFRESH_INTERVAL = Number(process.env.NEXT_PUBLIC_REFRESH_INTERVAL ?? 10000);

export default function HomePage() {
  const { bounds, updateBounds } = useMapBounds();
  const { aircraft, loading, error, lastUpdated } = useAircraftData(bounds, REFRESH_INTERVAL);
  const { watchlist, toggle: toggleWatch, isWatched } = useWatchlist();

  const [filters, setFilters] = useState<AircraftFilters>(DEFAULT_FILTERS);
  const [selectedIcao, setSelectedIcao] = useState<string | null>(null);
  const [followIcao, setFollowIcao] = useState<string | null>(null);
  const [sidebarMode, setSidebarMode] = useState<"detail" | "watchlist" | null>(null);

  const filteredAircraft = useMemo(() => applyFilters(aircraft, filters), [aircraft, filters]);

  const selectedAircraft = useMemo(
    () => aircraft.find((a) => a.icao24 === selectedIcao) ?? null,
    [aircraft, selectedIcao]
  );

  const inAirCount = useMemo(() => aircraft.filter((a) => !a.onGround).length, [aircraft]);
  const onGroundCount = aircraft.length - inAirCount;

  const handleSelectAircraft = useCallback((a: Aircraft) => {
    setSelectedIcao(a.icao24);
    setSidebarMode("detail");
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarMode(null);
    setSelectedIcao(null);
    setFollowIcao(null);
  }, []);

  const handleOpenWatchlist = useCallback(() => {
    setSidebarMode("watchlist");
    setSelectedIcao(null);
  }, []);

  const handleFollow = useCallback(() => {
    setFollowIcao((prev) => (prev === selectedIcao ? null : selectedIcao));
  }, [selectedIcao]);

  const handleBoundsChange = useCallback(
    (b: MapBounds) => updateBounds(b),
    [updateBounds]
  );

  return (
    <div className="flex h-full flex-col bg-aviation-bg">
      <TopBar
        filters={filters}
        onFiltersChange={setFilters}
        onOpenWatchlist={handleOpenWatchlist}
        watchlistCount={watchlist.size}
      />

      <StatsBar
        total={filteredAircraft.length}
        inAir={inAirCount}
        onGround={onGroundCount}
        loading={loading}
        lastUpdated={lastUpdated}
        error={error}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Map fills remaining space */}
        <div className="relative flex-1 overflow-hidden">
          <FlightMap
            aircraft={filteredAircraft}
            selectedIcao={selectedIcao}
            watchlist={watchlist}
            followIcao={followIcao}
            onSelectAircraft={handleSelectAircraft}
            onBoundsChange={handleBoundsChange}
          />

          {/* Follow mode indicator */}
          {followIcao && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-2 rounded-full border border-aviation-accent bg-aviation-panel/90 px-3 py-1.5 text-xs font-mono text-aviation-accent backdrop-blur-sm">
                <span className="animate-pulse">◎</span>
                Following {selectedAircraft?.callsign ?? selectedIcao}
                <button onClick={() => setFollowIcao(null)} className="ml-1 text-aviation-muted hover:text-aviation-text">
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <Sidebar
          mode={sidebarMode}
          selectedAircraft={selectedAircraft}
          watchlist={watchlist}
          allAircraft={aircraft}
          isWatched={selectedIcao ? isWatched(selectedIcao) : false}
          following={followIcao === selectedIcao}
          onToggleWatch={() => selectedIcao && toggleWatch(selectedIcao)}
          onFollow={handleFollow}
          onSelectAircraft={handleSelectAircraft}
          onRemoveWatch={toggleWatch}
          onClose={handleCloseSidebar}
        />
      </div>
    </div>
  );
}
