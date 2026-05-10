"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Map, {
  NavigationControl,
  ScaleControl,
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import type { Aircraft, MapBounds } from "@/types/aircraft";
import { hasPosition } from "@/utils/aircraft";
import { AircraftMarker } from "./AircraftMarker";
import "maplibre-gl/dist/maplibre-gl.css";

const TILE_URL =
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

interface Props {
  aircraft: Aircraft[];
  selectedIcao: string | null;
  watchlist: Set<string>;
  followIcao: string | null;
  onSelectAircraft: (a: Aircraft) => void;
  onBoundsChange: (b: MapBounds) => void;
}

export function FlightMap({
  aircraft,
  selectedIcao,
  watchlist,
  followIcao,
  onSelectAircraft,
  onBoundsChange,
}: Props) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const extractBounds = useCallback(
    (e: ViewStateChangeEvent | { target: MapRef }) => {
      const map = "target" in e ? e.target : (e as ViewStateChangeEvent).target;
      if (!map) return;
      const b = (map as MapRef).getBounds();
      if (!b) return;
      onBoundsChange({
        lamin: b.getSouth(),
        lomin: b.getWest(),
        lamax: b.getNorth(),
        lomax: b.getEast(),
      });
    },
    [onBoundsChange]
  );

  // Follow selected aircraft
  useEffect(() => {
    if (!followIcao || !mapRef.current) return;
    const target = aircraft.find((a) => a.icao24 === followIcao);
    if (!target || target.latitude == null || target.longitude == null) return;
    mapRef.current.easeTo({
      center: [target.longitude, target.latitude],
      duration: 800,
    });
  }, [followIcao, aircraft]);

  const positioned = aircraft.filter(hasPosition);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: Number(process.env.NEXT_PUBLIC_DEFAULT_LNG ?? 0),
        latitude: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT ?? 20),
        zoom: Number(process.env.NEXT_PUBLIC_DEFAULT_ZOOM ?? 3),
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={{
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [TILE_URL],
            tileSize: 256,
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      }}
      onLoad={(e) => {
        setMapLoaded(true);
        extractBounds({ target: e.target as unknown as MapRef });
      }}
      onMoveEnd={extractBounds}
      onZoomEnd={extractBounds}
    >
      <NavigationControl position="bottom-right" />
      <ScaleControl position="bottom-left" />

      {mapLoaded &&
        positioned.map((a) => (
          <AircraftMarker
            key={a.icao24}
            aircraft={a}
            selected={a.icao24 === selectedIcao}
            watched={watchlist.has(a.icao24)}
            onClick={() => onSelectAircraft(a)}
          />
        ))}
    </Map>
  );
}
