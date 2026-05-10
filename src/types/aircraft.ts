/** Raw state vector array from OpenSky REST API */
export type RawStateVector = [
  string,        // 0  icao24
  string | null, // 1  callsign
  string,        // 2  origin_country
  number | null, // 3  time_position
  number,        // 4  last_contact
  number | null, // 5  longitude
  number | null, // 6  latitude
  number | null, // 7  baro_altitude (meters)
  boolean,       // 8  on_ground
  number | null, // 9  velocity (m/s)
  number | null, // 10 true_track (degrees, 0=north, clockwise)
  number | null, // 11 vertical_rate (m/s)
  number[] | null, // 12 sensors
  number | null, // 13 geo_altitude (meters)
  string | null, // 14 squawk
  boolean,       // 15 spi
  number,        // 16 position_source
];

export interface Aircraft {
  icao24: string;
  callsign: string | null;
  originCountry: string;
  timePosition: number | null;
  lastContact: number;
  longitude: number | null;
  latitude: number | null;
  baroAltitude: number | null;
  onGround: boolean;
  velocity: number | null;
  trueTrack: number | null;
  verticalRate: number | null;
  geoAltitude: number | null;
  squawk: string | null;
  spi: boolean;
  positionSource: number;
}

export interface OpenSkyResponse {
  time: number;
  states: RawStateVector[] | null;
}

export interface MapBounds {
  lamin: number;
  lomin: number;
  lamax: number;
  lomax: number;
}

export interface AircraftFilters {
  searchQuery: string;
  altitudeMin: number | null;
  altitudeMax: number | null;
  speedMin: number | null;
  speedMax: number | null;
  onGroundOnly: boolean;
  inAirOnly: boolean;
  country: string;
}

export type VerticalTrend = "climbing" | "descending" | "level";

export interface AircraftWithTrend extends Aircraft {
  trend: VerticalTrend;
}
