import { NextRequest, NextResponse } from "next/server";

const WEATHER_BASE = "https://api.open-meteo.com/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "lat and lon are required" }, { status: 400 });
  }

  const url = `${WEATHER_BASE}/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&wind_speed_unit=knots`;

  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (!res.ok) {
      return NextResponse.json({ error: `Weather API error: ${res.status}` }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("Weather fetch error:", err);
    return NextResponse.json({ error: "Failed to reach Open-Meteo." }, { status: 502 });
  }
}
