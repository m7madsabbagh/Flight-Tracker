"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Layer, Popup, Source, useMap } from "react-map-gl/maplibre";
import type { MapMouseEvent } from "maplibre-gl";
import type { Aircraft } from "@/types/aircraft";
import { formatAltitude, formatSpeed, formatHeading, headingToCompass } from "@/utils/format";

// ─── Icon drawing ──────────────────────────────────────────────────────────

const ICON_SIZE = 36;

function drawPlane(
  ctx: CanvasRenderingContext2D,
  sz: number,
  color: string,
  small: boolean
) {
  const f = sz / 32;
  ctx.clearRect(0, 0, sz, sz);
  ctx.fillStyle = color;
  ctx.save();
  ctx.translate(sz / 2, sz / 2);
  ctx.beginPath();

  if (small) {
    // Private / GA aircraft — narrower wings, smaller tail
    ctx.moveTo(0, -10 * f);
    ctx.lineTo(2 * f, -5 * f);
    ctx.lineTo(2 * f, 0);
    ctx.lineTo(10 * f, 4 * f);
    ctx.lineTo(10 * f, 6 * f);
    ctx.lineTo(2 * f, 3 * f);
    ctx.lineTo(2 * f, 8 * f);
    ctx.lineTo(5 * f, 11 * f);
    ctx.lineTo(5 * f, 12.5 * f);
    ctx.lineTo(0, 10.5 * f);
    ctx.lineTo(-5 * f, 12.5 * f);
    ctx.lineTo(-5 * f, 11 * f);
    ctx.lineTo(-2 * f, 8 * f);
    ctx.lineTo(-2 * f, 3 * f);
    ctx.lineTo(-10 * f, 6 * f);
    ctx.lineTo(-10 * f, 4 * f);
    ctx.lineTo(-2 * f, 0);
    ctx.lineTo(-2 * f, -5 * f);
  } else {
    // Commercial jetliner — wide swept wings, wide tail
    ctx.moveTo(0, -14 * f);
    ctx.lineTo(2.5 * f, -7 * f);
    ctx.lineTo(2.5 * f, -2 * f);
    ctx.lineTo(14 * f, 5.5 * f);
    ctx.lineTo(14 * f, 8 * f);
    ctx.lineTo(2.5 * f, 4 * f);
    ctx.lineTo(2.5 * f, 10 * f);
    ctx.lineTo(7 * f, 14.5 * f);
    ctx.lineTo(7 * f, 16 * f);
    ctx.lineTo(0, 13.5 * f);
    ctx.lineTo(-7 * f, 16 * f);
    ctx.lineTo(-7 * f, 14.5 * f);
    ctx.lineTo(-2.5 * f, 10 * f);
    ctx.lineTo(-2.5 * f, 4 * f);
    ctx.lineTo(-14 * f, 8 * f);
    ctx.lineTo(-14 * f, 5.5 * f);
    ctx.lineTo(-2.5 * f, -2 * f);
    ctx.lineTo(-2.5 * f, -7 * f);
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

const ICON_DEFS = [
  { id: "pl-white",    color: "#f1f5f9", small: false },
  { id: "pl-gray",     color: "#64748b", small: false },
  { id: "pl-green",    color: "#00ff88", small: false },
  { id: "pl-amber",    color: "#f59e0b", small: false },
  { id: "pl-sm-white", color: "#f1f5f9", small: true  },
  { id: "pl-sm-gray",  color: "#64748b", small: true  },
  { id: "pl-sm-green", color: "#00ff88", small: true  },
  { id: "pl-sm-amber", color: "#f59e0b", small: true  },
] as const;

// ─── Helpers ───────────────────────────────────────────────────────────────

function isSmallAircraft(a: Aircraft): boolean {
  if (!a.callsign) return true;
  return !/^[A-Z]{2,3}\d{1,4}[A-Z]?$/.test(a.callsign.trim());
}

function iconId(
  onGround: boolean,
  selected: boolean,
  watched: boolean,
  small: boolean
): string {
  const prefix = small ? "pl-sm-" : "pl-";
  if (selected) return `${prefix}green`;
  if (watched) return `${prefix}amber`;
  if (onGround) return `${prefix}gray`;
  return `${prefix}white`;
}

function toGeoJSON(
  aircraft: Aircraft[],
  selectedIcao: string | null,
  watchlist: Set<string>
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: aircraft
      .filter((a) => a.latitude != null && a.longitude != null)
      .map((a) => {
        const small = isSmallAircraft(a);
        const selected = a.icao24 === selectedIcao;
        const watched = watchlist.has(a.icao24);
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [a.longitude!, a.latitude!],
          },
          properties: {
            icao24: a.icao24,
            callsign: a.callsign ?? "",
            country: a.originCountry,
            heading: a.trueTrack ?? 0,
            altitude: a.baroAltitude ?? null,
            speed: a.velocity ?? null,
            onGround: a.onGround,
            iconId: iconId(a.onGround, selected, watched, small),
          },
        };
      }),
  };
}

// ─── Component ─────────────────────────────────────────────────────────────

interface HoverInfo {
  lng: number;
  lat: number;
  icao24: string;
  callsign: string;
  country: string;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  onGround: boolean;
}

interface Props {
  aircraft: Aircraft[];
  selectedIcao: string | null;
  watchlist: Set<string>;
  onSelect: (icao24: string) => void;
}

export function AircraftLayer({ aircraft, selectedIcao, watchlist, onSelect }: Props) {
  const { current: map } = useMap();
  const [iconsReady, setIconsReady] = useState(false);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Register icon images once
  useEffect(() => {
    if (!map) return;
    let loaded = 0;
    const total = ICON_DEFS.length;
    ICON_DEFS.forEach(({ id, color, small }) => {
      if (map.hasImage(id)) {
        if (++loaded === total) setIconsReady(true);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = ICON_SIZE;
      canvas.height = ICON_SIZE;
      const ctx = canvas.getContext("2d")!;
      drawPlane(ctx, ICON_SIZE, color, small);
      const imgData = ctx.getImageData(0, 0, ICON_SIZE, ICON_SIZE);
      map.addImage(id, {
        width: ICON_SIZE,
        height: ICON_SIZE,
        data: imgData.data,
      } as Parameters<typeof map.addImage>[1]);
      if (++loaded === total) setIconsReady(true);
    });
  }, [map]);

  // Attach map event listeners for the symbol layer
  useEffect(() => {
    if (!map || !iconsReady) return;

    const onMouseEnter = (e: MapMouseEvent & { features?: GeoJSON.Feature[] }) => {
      map.getCanvas().style.cursor = "pointer";
      const f = e.features?.[0];
      if (!f) return;
      const p = f.properties as HoverInfo & { heading: number };
      setHover({
        lng: (f.geometry as GeoJSON.Point).coordinates[0],
        lat: (f.geometry as GeoJSON.Point).coordinates[1],
        icao24: p.icao24,
        callsign: p.callsign,
        country: p.country,
        altitude: p.altitude,
        speed: p.speed,
        heading: p.heading,
        onGround: p.onGround,
      });
    };

    const onMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      setHover(null);
    };

    const onClick = (e: MapMouseEvent & { features?: GeoJSON.Feature[] }) => {
      const f = e.features?.[0];
      if (f) onSelectRef.current((f.properties as { icao24: string }).icao24);
    };

    map.on("mouseenter", "aircraft-symbols", onMouseEnter);
    map.on("mouseleave", "aircraft-symbols", onMouseLeave);
    map.on("click", "aircraft-symbols", onClick);
    return () => {
      map.off("mouseenter", "aircraft-symbols", onMouseEnter);
      map.off("mouseleave", "aircraft-symbols", onMouseLeave);
      map.off("click", "aircraft-symbols", onClick);
    };
  }, [map, iconsReady]);

  const geojson = useMemo(
    () => toGeoJSON(aircraft, selectedIcao, watchlist),
    [aircraft, selectedIcao, watchlist]
  );

  if (!iconsReady) return null;

  return (
    <>
      <Source id="aircraft-src" type="geojson" data={geojson}>
        <Layer
          id="aircraft-symbols"
          type="symbol"
          layout={{
            "icon-image": ["get", "iconId"],
            "icon-size": 0.85,
            "icon-rotate": ["get", "heading"],
            "icon-rotation-alignment": "map",
            "icon-allow-overlap": true,
            "icon-ignore-placement": true,
            "symbol-sort-key": ["case", ["get", "onGround"], 0, 1],
          }}
        />
      </Source>

      {hover && (
        <Popup
          longitude={hover.lng}
          latitude={hover.lat}
          closeButton={false}
          closeOnClick={false}
          anchor="bottom"
          offset={20}
          className="aircraft-popup"
        >
          <div style={{
            background: "#0f1729",
            border: "1px solid #1e2d4a",
            borderRadius: "8px",
            padding: "8px 12px",
            minWidth: "140px",
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <p style={{ color: "#f1f5f9", fontWeight: 700, fontSize: "13px", margin: 0 }}>
              {hover.callsign || hover.icao24.toUpperCase()}
            </p>
            <p style={{ color: "#64748b", fontSize: "11px", margin: "2px 0 4px" }}>
              {hover.country}
            </p>
            <div style={{ display: "flex", gap: "10px", fontSize: "11px", color: "#94a3b8" }}>
              <span>{formatAltitude(hover.altitude)}</span>
              <span>{formatSpeed(hover.speed)}</span>
            </div>
            {hover.heading != null && (
              <p style={{ color: "#94a3b8", fontSize: "11px", margin: "2px 0 0" }}>
                {formatHeading(hover.heading)} {headingToCompass(hover.heading)}
              </p>
            )}
            {hover.onGround && (
              <p style={{ color: "#f59e0b", fontSize: "11px", margin: "2px 0 0" }}>On Ground</p>
            )}
          </div>
        </Popup>
      )}
    </>
  );
}
