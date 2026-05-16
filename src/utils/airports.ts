import airportsData from "@/data/airports.json";

type AirportRecord = { n: string; c: string; o: string; lat: number; lon: number; iata: string };
const db = airportsData as Record<string, AirportRecord>;

export interface AirportInfo {
  icao: string;
  iata: string;
  name: string;
  city: string;
  country: string;
}

export function lookupAirport(icao: string | null | undefined): AirportInfo | null {
  if (!icao) return null;
  const key = icao.toUpperCase();
  const entry = db[key];
  if (!entry) return { icao: key, iata: "", name: key, city: "", country: "" };
  return { icao: key, iata: entry.iata, name: entry.n, city: entry.c, country: entry.o };
}
