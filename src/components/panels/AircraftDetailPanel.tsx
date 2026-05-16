"use client";

import type { Aircraft } from "@/types/aircraft";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useWeather } from "@/hooks/useWeather";
import { useRouteInfo } from "@/hooks/useRouteInfo";
import {
  formatAltitude,
  formatCoord,
  formatHeading,
  formatSpeed,
  formatTimestamp,
  formatVerticalRate,
  headingToCompass,
  weatherCodeToLabel,
} from "@/utils/format";
import { getVerticalTrend } from "@/utils/aircraft";

interface Props {
  aircraft: Aircraft;
  isWatched: boolean;
  onToggleWatch: () => void;
  onFollow: () => void;
  following: boolean;
  onClose: () => void;
}

export function AircraftDetailPanel({
  aircraft,
  isWatched,
  onToggleWatch,
  onFollow,
  following,
  onClose,
}: Props) {
  const trend = getVerticalTrend(aircraft.verticalRate);
  const { weather } = useWeather(aircraft.latitude, aircraft.longitude);
  const { route, loading: routeLoading } = useRouteInfo(aircraft.icao24);

  const trendIcon = trend === "climbing" ? "▲" : trend === "descending" ? "▼" : "—";
  const trendColor =
    trend === "climbing"
      ? "text-aviation-highlight"
      : trend === "descending"
      ? "text-aviation-danger"
      : "text-aviation-muted";

  return (
    <div className="flex h-full flex-col animate-slide-in">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-aviation-border px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-mono text-aviation-text">
              {aircraft.callsign ?? "NO CALLSIGN"}
            </span>
            <span className={`text-sm font-mono ${trendColor}`}>{trendIcon}</span>
          </div>
          <p className="text-xs text-aviation-muted mt-0.5">
            {aircraft.icao24.toUpperCase()} · {aircraft.originCountry}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <ActionBtn onClick={onToggleWatch} active={isWatched} activeClass="text-aviation-warning" title={isWatched ? "Remove from watchlist" : "Add to watchlist"}>
            {isWatched ? "★" : "☆"}
          </ActionBtn>
          <ActionBtn onClick={onFollow} active={following} activeClass="text-aviation-accent" title={following ? "Stop following" : "Follow aircraft"}>
            ◎
          </ActionBtn>
          <button onClick={onClose} className="p-1.5 text-aviation-muted hover:text-aviation-text">✕</button>
        </div>
      </div>

      {/* Route banner */}
      <div className="border-b border-aviation-border px-4 py-2">
        {routeLoading ? (
          <LoadingSpinner size="sm" label="Fetching route…" />
        ) : route?.departure || route?.arrival ? (
          <div className="flex items-center gap-2 font-mono text-sm">
            <span className="font-bold text-aviation-text">{route.departure ?? "????"}</span>
            <span className="text-aviation-dim">→</span>
            <span className="font-bold text-aviation-text">{route.arrival ?? "????"}</span>
          </div>
        ) : (
          <p className="text-xs text-aviation-dim">Route data unavailable</p>
        )}
      </div>

      {/* Status badges */}
      <div className="flex flex-wrap gap-2 px-4 py-2 border-b border-aviation-border">
        <Badge variant={aircraft.onGround ? "warning" : "success"}>
          {aircraft.onGround ? "ON GROUND" : "IN AIR"}
        </Badge>
        {aircraft.squawk && <Badge variant="accent">SQK {aircraft.squawk}</Badge>}
        {trend !== "level" && (
          <Badge variant={trend === "climbing" ? "success" : "danger"}>
            {trend.toUpperCase()}
          </Badge>
        )}
      </div>

      {/* Data rows */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <Section title="Position">
          <Row label="Latitude" value={formatCoord(aircraft.latitude)} />
          <Row label="Longitude" value={formatCoord(aircraft.longitude)} />
          <Row label="Baro Alt" value={formatAltitude(aircraft.baroAltitude)} />
          <Row label="Geo Alt" value={formatAltitude(aircraft.geoAltitude)} />
        </Section>

        <Section title="Movement">
          <Row label="Speed" value={formatSpeed(aircraft.velocity)} />
          <Row label="Heading" value={`${formatHeading(aircraft.trueTrack)} (${headingToCompass(aircraft.trueTrack)})`} />
          <Row label="Vert. Rate" value={formatVerticalRate(aircraft.verticalRate)} />
        </Section>

        <Section title="Transponder">
          <Row label="ICAO24" value={aircraft.icao24.toUpperCase()} mono />
          <Row label="Callsign" value={aircraft.callsign ?? "—"} mono />
          <Row label="Country" value={aircraft.originCountry} />
          <Row label="Last Contact" value={formatTimestamp(aircraft.lastContact)} />
          <Row label="SPI" value={aircraft.spi ? "Active" : "Inactive"} />
        </Section>

        {weather && (
          <Section title="Local Weather">
            <Row label="Temp" value={`${weather.current_weather.temperature}°C`} />
            <Row
              label="Wind"
              value={`${Math.round(weather.current_weather.windspeed)} kts @ ${Math.round(weather.current_weather.winddirection)}°`}
            />
            <Row label="Conditions" value={weatherCodeToLabel(weather.current_weather.weathercode)} />
          </Section>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-aviation-dim mb-1.5">
        {title}
      </p>
      <div className="rounded-lg border border-aviation-border bg-aviation-bg divide-y divide-aviation-border/50">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-xs text-aviation-muted">{label}</span>
      <span className={`text-xs text-aviation-text ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function ActionBtn({
  children, onClick, active, activeClass, title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  activeClass: string;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 text-lg transition-colors ${active ? activeClass : "text-aviation-muted hover:text-aviation-text"}`}
    >
      {children}
    </button>
  );
}
