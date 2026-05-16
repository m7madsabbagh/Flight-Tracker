import { NextRequest, NextResponse } from "next/server";
import type { OpenSkyResponse } from "@/types/aircraft";

const OPENSKY_BASE = "https://opensky-network.org/api";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;

  const lamin = searchParams.get("lamin");
  const lomin = searchParams.get("lomin");
  const lamax = searchParams.get("lamax");
  const lomax = searchParams.get("lomax");

  const params = new URLSearchParams();
  if (lamin) params.set("lamin", lamin);
  if (lomin) params.set("lomin", lomin);
  if (lamax) params.set("lamax", lamax);
  if (lomax) params.set("lomax", lomax);

  const url = `${OPENSKY_BASE}/states/all?${params.toString()}`;

  const headers: HeadersInit = {
    "Accept": "application/json",
  };

  // Use credentials if provided to get higher rate limits
  const username = process.env.OPENSKY_USERNAME;
  const password = process.env.OPENSKY_PASSWORD;
  if (username && password) {
    const encoded = Buffer.from(`${username}:${password}`).toString("base64");
    headers["Authorization"] = `Basic ${encoded}`;
  }

  try {
    const res = await fetch(url, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(9000),
    });

    if (res.status === 429) {
      return NextResponse.json(
        { error: "Rate limited by OpenSky. Please wait a moment." },
        { status: 429 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: `OpenSky API error: ${res.status}` },
        { status: res.status }
      );
    }

    const data: OpenSkyResponse = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("OpenSky fetch error:", err);
    return NextResponse.json(
      { error: "Failed to reach OpenSky Network." },
      { status: 502 }
    );
  }
}
