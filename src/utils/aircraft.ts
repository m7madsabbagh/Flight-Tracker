import type { Aircraft, AircraftFilters, AircraftWithTrend, RawStateVector, VerticalTrend } from "@/types/aircraft";

export function parseStateVector(raw: RawStateVector): Aircraft {
  return {
    icao24: raw[0],
    callsign: raw[1]?.trim() || null,
    originCountry: raw[2],
    timePosition: raw[3],
    lastContact: raw[4],
    longitude: raw[5],
    latitude: raw[6],
    baroAltitude: raw[7],
    onGround: raw[8],
    velocity: raw[9],
    trueTrack: raw[10],
    verticalRate: raw[11],
    geoAltitude: raw[13],
    squawk: raw[14],
    spi: raw[15],
    positionSource: raw[16],
  };
}

export function getVerticalTrend(verticalRate: number | null): VerticalTrend {
  if (verticalRate == null || Math.abs(verticalRate) < 0.5) return "level";
  return verticalRate > 0 ? "climbing" : "descending";
}

export function withTrend(aircraft: Aircraft): AircraftWithTrend {
  return { ...aircraft, trend: getVerticalTrend(aircraft.verticalRate) };
}

export function applyFilters(
  aircraft: Aircraft[],
  filters: AircraftFilters
): Aircraft[] {
  const q = filters.searchQuery.trim().toLowerCase();

  return aircraft.filter((a) => {
    if (q) {
      const callsign = (a.callsign ?? "").toLowerCase();
      const icao = a.icao24.toLowerCase();
      if (!callsign.includes(q) && !icao.includes(q)) return false;
    }

    if (filters.onGroundOnly && !a.onGround) return false;
    if (filters.inAirOnly && a.onGround) return false;

    if (filters.altitudeMin != null && a.baroAltitude != null) {
      // altitudeMin is in feet, baroAltitude is in meters
      if (a.baroAltitude * 3.28084 < filters.altitudeMin) return false;
    }
    if (filters.altitudeMax != null && a.baroAltitude != null) {
      if (a.baroAltitude * 3.28084 > filters.altitudeMax) return false;
    }

    if (filters.speedMin != null && a.velocity != null) {
      // speedMin is in knots, velocity is in m/s
      if (a.velocity * 1.94384 < filters.speedMin) return false;
    }
    if (filters.speedMax != null && a.velocity != null) {
      if (a.velocity * 1.94384 > filters.speedMax) return false;
    }

    if (filters.country) {
      if (!a.originCountry.toLowerCase().includes(filters.country.toLowerCase())) return false;
    }

    return true;
  });
}

export function hasPosition(a: Aircraft): a is Aircraft & { latitude: number; longitude: number } {
  return a.latitude != null && a.longitude != null;
}
