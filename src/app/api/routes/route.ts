import { NextRequest, NextResponse } from "next/server";
import { lookupAirport, type AirportInfo } from "@/utils/airports";

export interface RouteResponse {
  departure: AirportInfo | null;
  arrival: AirportInfo | null;
  departureTime: number | null;
}

const NULL_ROUTE: RouteResponse = { departure: null, arrival: null, departureTime: null };

export async function GET(req: NextRequest) {
  const icao24 = req.nextUrl.searchParams.get("icao24");
  if (!icao24) return NextResponse.json(NULL_ROUTE, { status: 400 });

  const now = Math.floor(Date.now() / 1000);
  const begin = now - 86400;

  const url = `https://opensky-network.org/api/flights/aircraft?icao24=${encodeURIComponent(icao24)}&begin=${begin}&end=${now}`;

  const headers: HeadersInit = { Accept: "application/json" };
  const username = process.env.OPENSKY_USERNAME;
  const password = process.env.OPENSKY_PASSWORD;
  if (username && password) {
    const b64 = Buffer.from(`${username}:${password}`).toString("base64");
    headers["Authorization"] = `Basic ${b64}`;
  }

  try {
    const res = await fetch(url, { headers, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) return NextResponse.json(NULL_ROUTE);

    const data = await res.json();
    const flights = Array.isArray(data) ? data : [];
    const latest = flights[flights.length - 1] ?? null;

    const response: RouteResponse = {
      departure: lookupAirport(latest?.estDepartureAirport),
      arrival: lookupAirport(latest?.estArrivalAirport),
      departureTime: latest?.firstSeen ?? null,
    };
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(NULL_ROUTE);
  }
}
