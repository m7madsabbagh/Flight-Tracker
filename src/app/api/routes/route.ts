import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const icao24 = req.nextUrl.searchParams.get("icao24");
  if (!icao24) {
    return NextResponse.json({ error: "icao24 required" }, { status: 400 });
  }

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
    if (!res.ok) {
      return NextResponse.json({ departure: null, arrival: null });
    }
    const data = await res.json();
    const flights = Array.isArray(data) ? data : [];
    const latest = flights[flights.length - 1] ?? null;
    return NextResponse.json({
      departure: latest?.estDepartureAirport ?? null,
      arrival: latest?.estArrivalAirport ?? null,
    });
  } catch {
    return NextResponse.json({ departure: null, arrival: null });
  }
}
