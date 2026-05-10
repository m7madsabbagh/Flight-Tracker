/** SVG aircraft icon, rotatable by heading. Used both in the map as HTML markers and in the legend. */
export function AircraftIcon({
  heading = 0,
  size = 24,
  color = "#00d4ff",
  onGround = false,
}: {
  heading?: number;
  size?: number;
  color?: string;
  onGround?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ transform: `rotate(${heading}deg)`, display: "block" }}
      fill={onGround ? "#64748b" : color}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simple top-down aircraft silhouette */}
      <path d="M12 2L8.5 10H5l1.5 2H9l-1 6 4-2 4 2-1-6h2.5L20 10h-3.5L12 2z" />
    </svg>
  );
}
