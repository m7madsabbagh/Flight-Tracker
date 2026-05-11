# Flight Tracker ✈

A production-quality, live flight tracker web app built as a serious GitHub portfolio project.

**Stack:** Next.js 15 · TypeScript · MapLibre GL JS · Tailwind CSS · OpenSky Network · Open-Meteo

---

## Features

- **Live aircraft map** — real-time positions from OpenSky Network, refreshed every 10 seconds
- **Bounding-box queries** — only fetches aircraft in the visible viewport
- **Aircraft detail panel** — callsign, ICAO24, altitude, speed, heading, vertical rate, trend, squawk, last contact, local weather
- **Search** — filter by callsign or ICAO24 in real time
- **Filters** — altitude range (ft), speed range (kts), in-air / on-ground, country
- **Follow mode** — keeps selected aircraft centred on the map
- **Watchlist** — saved to `localStorage`, persists across sessions
- **Local weather widget** — Open-Meteo weather at selected aircraft's coordinates
- **Dark aviation theme** — polished, desktop-first, mobile-friendly
- **Graceful error handling** — loading states, empty states, rate-limit messages

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/your-username/matchflight.git
cd matchflight
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`. All values are optional — the app works without credentials.

```env
# Optional: OpenSky credentials give higher rate limits (10 req/10s vs 1 req/10s)
OPENSKY_USERNAME=your_username
OPENSKY_PASSWORD=your_password

# Optional: Override map defaults
NEXT_PUBLIC_DEFAULT_LAT=20
NEXT_PUBLIC_DEFAULT_LNG=0
NEXT_PUBLIC_DEFAULT_ZOOM=3
NEXT_PUBLIC_REFRESH_INTERVAL=10000
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Folder Structure

```
src/
├── app/
│   ├── api/
│   │   ├── aircraft/route.ts   # Server-side OpenSky proxy
│   │   └── weather/route.ts    # Server-side Open-Meteo proxy
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # Main page (client component)
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx          # Search, filters, watchlist button
│   │   └── Sidebar.tsx         # Detail panel / watchlist switcher
│   ├── map/
│   │   ├── FlightMap.tsx       # MapLibre GL map wrapper
│   │   ├── AircraftMarker.tsx  # Per-aircraft HTML marker
│   │   └── AircraftIcon.tsx    # Rotatable SVG icon
│   ├── panels/
│   │   ├── AircraftDetailPanel.tsx
│   │   └── WatchlistPanel.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── EmptyState.tsx
│       ├── FilterPanel.tsx
│       ├── LoadingSpinner.tsx
│       ├── SearchBar.tsx
│       └── StatsBar.tsx
├── hooks/
│   ├── useAircraftData.ts      # Polling + abort controller
│   ├── useMapBounds.ts         # Debounced viewport bounds
│   ├── useWatchlist.ts         # localStorage watchlist
│   └── useWeather.ts           # Open-Meteo per-aircraft weather
├── types/
│   ├── aircraft.ts             # All aircraft domain types
│   └── weather.ts
└── utils/
    ├── aircraft.ts             # Parsing, filtering, trend detection
    └── format.ts               # Unit conversions and display helpers
```

---

## Free API Limits & Upgrade Path

| Service | Limit (unauthenticated) | Limit (authenticated) | Upgrade |
|---|---|---|---|
| OpenSky Network | 1 req / 10 s | 10 req / 10 s | Free account at opensky-network.org |
| Open-Meteo | 10,000 req/day | — | Commercial plan for higher volume |
| OpenStreetMap tiles | Per usage policy | — | Switch to a self-hosted or paid tile server (Protomaps, Stadia Maps) |

The API layer is isolated behind `/api/*` route handlers. Swapping the data source only requires editing those files — nothing in the client components changes.

---

## Architecture Notes

- **Server-side proxy** — the OpenSky credentials never reach the browser. All external fetches happen in Next.js route handlers.
- **Viewport-aware fetching** — the map emits bounds on every pan/zoom, the hook debounces changes > 0.5°, and the API only requests that bounding box.
- **Dynamic import** — `FlightMap` is loaded client-side only (`ssr: false`) because MapLibre GL JS requires `window` / WebGL.
- **Type-safe parsing** — `parseStateVector` converts the raw array tuple to a named `Aircraft` object at the API boundary.

---

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

---

## License

MIT
