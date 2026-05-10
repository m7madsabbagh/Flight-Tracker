"use client";

import { useState } from "react";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterPanel } from "@/components/ui/FilterPanel";
import type { AircraftFilters } from "@/types/aircraft";

interface Props {
  filters: AircraftFilters;
  onFiltersChange: (f: AircraftFilters) => void;
  onOpenWatchlist: () => void;
  watchlistCount: number;
}

export function TopBar({ filters, onFiltersChange, onOpenWatchlist, watchlistCount }: Props) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    filters.inAirOnly ||
    filters.onGroundOnly ||
    filters.altitudeMin != null ||
    filters.altitudeMax != null ||
    filters.speedMin != null ||
    filters.speedMax != null ||
    filters.country !== "";

  return (
    <header className="relative flex items-center gap-3 border-b border-aviation-border bg-aviation-panel/95 px-4 py-2 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-lg">✈</span>
        <span className="hidden sm:block text-sm font-bold font-mono text-aviation-accent tracking-widest">
          MATCHFLIGHT
        </span>
      </div>

      <div className="h-5 w-px bg-aviation-border hidden sm:block" />

      {/* Search */}
      <div className="flex-1 max-w-sm">
        <SearchBar
          value={filters.searchQuery}
          onChange={(v) => onFiltersChange({ ...filters, searchQuery: v })}
        />
      </div>

      {/* Filter toggle */}
      <button
        onClick={() => setShowFilters((s) => !s)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
          hasActiveFilters || showFilters
            ? "border-aviation-accent bg-aviation-accent/10 text-aviation-accent"
            : "border-aviation-border text-aviation-muted hover:border-aviation-accent hover:text-aviation-accent"
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 12h10M11 20h2" />
        </svg>
        Filters
        {hasActiveFilters && (
          <span className="ml-0.5 rounded-full bg-aviation-accent px-1 py-0.5 text-[10px] text-aviation-bg font-bold leading-none">
            !
          </span>
        )}
      </button>

      {/* Watchlist */}
      <button
        onClick={onOpenWatchlist}
        className="flex items-center gap-1.5 rounded-lg border border-aviation-border px-3 py-2 text-xs font-medium text-aviation-muted hover:border-aviation-warning hover:text-aviation-warning transition-colors"
      >
        ★
        <span className="hidden sm:inline">Watchlist</span>
        {watchlistCount > 0 && (
          <span className="ml-0.5 rounded-full bg-aviation-warning px-1 py-0.5 text-[10px] text-aviation-bg font-bold leading-none">
            {watchlistCount}
          </span>
        )}
      </button>

      {/* Filter dropdown */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 sm:left-auto sm:right-4 z-50 mt-1 sm:w-72 px-4 sm:px-0">
          <FilterPanel
            filters={filters}
            onChange={onFiltersChange}
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}
    </header>
  );
}
