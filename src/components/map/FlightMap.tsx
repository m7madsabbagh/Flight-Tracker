"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Map, {
  AttributionControl,
  Layer,
  NavigationControl,
  ScaleControl,
  Source,
  type MapRef,
  type ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import type { MapBounds } from "@/types/aircraft";
import type { Aircraft } from "@/types/aircraft";
import { getNightGeoJSON } from "@/utils/daynight";
import { AircraftLayer } from "./AircraftLayer";
import "maplibre-gl/dist/maplibre-gl.css";

const ARCGIS_BASE =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";
const ARCGIS_LABELS =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}";
const ARCGIS_ATTRIBUTION =
  'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, DeLorme, NAVTEQ';

const MAP_STYLE = {
  version: 8 as const,
  sources: {
    "arcgis-base": {
      type: "raster" as const,
      tiles: [ARCGIS_BASE],
      tileSize: 256,
      maxzoom: 16,
      attribution: ARCGIS_ATTRIBUTION,
    },
    "arcgis-labels": {
      type: "raster" as const,
      tiles: [ARCGIS_LABELS],
      tileSize: 256,
      maxzoom: 16,
    },
  },
  layers: [
    {
      id: "arcgis-base-tiles",
      type: "raster" as const,
      source: "arcgis-base",
      minzoom: 0,
      maxzoom: 22,
    },
    {
      id: "arcgis-labels-tiles",
      type: "raster" as const,
      source: "arcgis-labels",
      minzoom: 0,
      maxzoom: 22,
    },
  ],
};

interface Props {
  aircraft: Aircraft[];
  selectedIcao: string | null;
  watchlist: Set<string>;
  followIcao: string | null;
  onSelectIcao: (icao24: string) => void;
  onBoundsChange: (b: MapBounds) => void;
}

export function FlightMap({
  aircraft,
  selectedIcao,
  watchlist,
  followIcao,
  onSelectIcao,
  onBoundsChange,
}: Props) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [nightGeoJSON, setNightGeoJSON] = useState(() => getNightGeoJSON(new Date()));

  // Update night shade every 60 seconds
  useEffect(() => {
    const id = setInterval(() => setNightGeoJSON(getNightGeoJSON(new Date())), 60_000);
    return () => clearInterval(id);
  }, []);

  const extractBounds = useCallback(() => {
    const b = mapRef.current?.getBounds();
    if (!b) return;
    onBoundsChange({
      lamin: b.getSouth(),
      lomin: b.getWest(),
      lamax: b.getNorth(),
      lomax: b.getEast(),
    });
  }, [onBoundsChange]);

  const handleMoveEnd = useCallback(
    (_e: ViewStateChangeEvent) => extractBounds(),
    [extractBounds]
  );

  // Follow selected aircraft
  useEffect(() => {
    if (!followIcao || !mapRef.current) return;
    const target = aircraft.find((a) => a.icao24 === followIcao);
    if (!target?.latitude || !target?.longitude) return;
    mapRef.current.easeTo({
      center: [target.longitude, target.latitude],
      duration: 800,
    });
  }, [followIcao, aircraft]);

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: Number(process.env.NEXT_PUBLIC_DEFAULT_LNG ?? 0),
        latitude: Number(process.env.NEXT_PUBLIC_DEFAULT_LAT ?? 20),
        zoom: Number(process.env.NEXT_PUBLIC_DEFAULT_ZOOM ?? 3),
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={MAP_STYLE}
      attributionControl={false}
      onLoad={() => {
        setMapLoaded(true);
        extractBounds();
      }}
      onMoveEnd={handleMoveEnd}
    >
      <NavigationControl position="bottom-right" />
      <ScaleControl position="bottom-left" unit="metric" />
      <AttributionControl position="bottom-right" compact />

      {/* Day/night terminator */}
      <Source id="night" type="geojson" data={nightGeoJSON}>
        <Layer
          id="night-fill"
          type="fill"
          paint={{
            "fill-color": "#000010",
            "fill-opacity": 0.35,
          }}
        />
      </Source>

      {mapLoaded && (
        <AircraftLayer
          aircraft={aircraft}
          selectedIcao={selectedIcao}
          watchlist={watchlist}
          onSelect={onSelectIcao}
        />
      )}
    </Map>
  );
}
