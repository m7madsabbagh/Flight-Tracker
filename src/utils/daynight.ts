import type { Feature, FeatureCollection, Polygon } from "geojson";

function getDayOfYear(date: Date): number {
  const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.floor((date.getTime() - start.getTime()) / 86400000) + 1;
}

/** Solar declination in radians (Spencer 1971 approximation) */
function getSolarDeclination(date: Date): number {
  const N = getDayOfYear(date) - 1;
  const A = (2 * Math.PI * N) / 365;
  return (
    0.006918 -
    0.399912 * Math.cos(A) +
    0.070257 * Math.sin(A) -
    0.006758 * Math.cos(2 * A) +
    0.000907 * Math.sin(2 * A) -
    0.002697 * Math.cos(3 * A) +
    0.00148 * Math.sin(3 * A)
  );
}

/** Subsolar longitude in degrees */
function getSubsolarLon(date: Date): number {
  const utcH =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  return -(utcH - 12) * 15;
}

/**
 * GeoJSON polygon covering the night side of Earth.
 * The terminator follows the sinusoidal pattern visible in FlightRadar24.
 */
export function getNightGeoJSON(date: Date): FeatureCollection<Polygon> {
  const decl = getSolarDeclination(date);
  const subLon = getSubsolarLon(date);
  const subLonRad = (subLon * Math.PI) / 180;

  const term: [number, number][] = [];

  if (Math.abs(decl) < 0.001) {
    // Near equinox – terminator is a meridian
    const tLon = subLon + 90;
    for (let lat = -90; lat <= 90; lat++) term.push([tLon, lat]);
  } else {
    for (let lon = -180; lon <= 180; lon++) {
      const lonRad = (lon * Math.PI) / 180;
      const latRad = Math.atan(-Math.cos(lonRad - subLonRad) / Math.tan(decl));
      term.push([lon, (latRad * 180) / Math.PI]);
    }
  }

  // Night pole is in the hemisphere opposite the sun
  const pole: -90 | 90 = decl > 0 ? -90 : 90;

  const ring: [number, number][] = [
    [-180, pole],
    ...term,
    [180, pole],
    [-180, pole],
  ];

  const feature: Feature<Polygon> = {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [ring] },
    properties: {},
  };

  return { type: "FeatureCollection", features: [feature] };
}
