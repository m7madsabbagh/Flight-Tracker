"use client";

import { Marker } from "react-map-gl/maplibre";
import type { Aircraft } from "@/types/aircraft";
import { AircraftIcon } from "./AircraftIcon";
import { formatAltitude, formatSpeed } from "@/utils/format";

interface Props {
  aircraft: Aircraft;
  selected: boolean;
  watched: boolean;
  onClick: () => void;
}

export function AircraftMarker({ aircraft, selected, watched, onClick }: Props) {
  const { longitude, latitude, trueTrack, onGround, callsign } = aircraft;
  if (longitude == null || latitude == null) return null;

  const color = watched
    ? "#ffaa00"
    : selected
    ? "#00ff88"
    : onGround
    ? "#64748b"
    : "#00d4ff";

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onClick();
      }}
    >
      <div className="group relative cursor-pointer" title={callsign ?? aircraft.icao24}>
        {/* Selection ring */}
        {selected && (
          <div className="absolute inset-0 -m-2 rounded-full border-2 border-aviation-highlight animate-pulse-slow" />
        )}

        <AircraftIcon
          heading={trueTrack ?? 0}
          size={selected ? 28 : 20}
          color={color}
          onGround={onGround}
        />

        {/* Tooltip on hover */}
        <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-aviation-panel border border-aviation-border px-2 py-1 text-xs font-mono text-aviation-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          <p className="font-semibold">{callsign ?? aircraft.icao24.toUpperCase()}</p>
          <p className="text-aviation-muted">
            {formatAltitude(aircraft.baroAltitude)} · {formatSpeed(aircraft.velocity)}
          </p>
        </div>
      </div>
    </Marker>
  );
}
