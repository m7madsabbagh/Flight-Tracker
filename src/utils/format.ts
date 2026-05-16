/** Convert meters to feet */
export function metersToFeet(m: number): number {
  return Math.round(m * 3.28084);
}

/** Convert m/s to knots */
export function msToKnots(ms: number): number {
  return Math.round(ms * 1.94384);
}

/** Convert m/s to km/h */
export function msToKmh(ms: number): number {
  return Math.round(ms * 3.6);
}

/** Format altitude with unit */
export function formatAltitude(meters: number | null): string {
  if (meters == null) return "N/A";
  return `${metersToFeet(meters).toLocaleString()} ft`;
}

/** Format speed with unit */
export function formatSpeed(ms: number | null): string {
  if (ms == null) return "N/A";
  return `${msToKnots(ms)} kts`;
}

/** Format vertical rate */
export function formatVerticalRate(ms: number | null): string {
  if (ms == null) return "N/A";
  const fpm = Math.round(ms * 196.85);
  const sign = fpm > 0 ? "+" : "";
  return `${sign}${fpm.toLocaleString()} fpm`;
}

/** Format heading in degrees */
export function formatHeading(degrees: number | null): string {
  if (degrees == null) return "N/A";
  return `${Math.round(degrees)}°`;
}

/** Format Unix timestamp to local time */
export function formatTimestamp(unix: number | null): string {
  if (unix == null) return "N/A";
  return new Date(unix * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Format Unix timestamp as "16 May 14:35 UTC" */
export function formatDepartureTime(unix: number | null): string {
  if (unix == null) return "";
  const d = new Date(unix * 1000);
  const day = d.getUTCDate();
  const month = d.toLocaleString("en", { month: "short", timeZone: "UTC" });
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${hh}:${mm} UTC`;
}

/** Format lat/lng coordinate */
export function formatCoord(val: number | null, decimals = 4): string {
  if (val == null) return "N/A";
  return val.toFixed(decimals);
}

const HEADING_LABELS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

/** Convert heading degrees to compass label */
export function headingToCompass(degrees: number | null): string {
  if (degrees == null) return "N/A";
  const idx = Math.round(degrees / 45) % 8;
  return HEADING_LABELS[idx];
}

/** WMO weather code to human-readable description */
export function weatherCodeToLabel(code: number): string {
  const codes: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Icy fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Slight rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Rain showers",
    82: "Heavy showers",
    95: "Thunderstorm",
    96: "Thunderstorm w/ hail",
    99: "Thunderstorm w/ hail",
  };
  return codes[code] ?? `Code ${code}`;
}
