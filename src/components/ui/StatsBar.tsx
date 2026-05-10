import { LoadingSpinner } from "./LoadingSpinner";

interface Props {
  total: number;
  inAir: number;
  onGround: number;
  loading: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

export function StatsBar({ total, inAir, onGround, loading, lastUpdated, error }: Props) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 text-xs font-mono">
      <Stat label="TOTAL" value={total} color="text-aviation-text" />
      <div className="h-3 w-px bg-aviation-border" />
      <Stat label="IN AIR" value={inAir} color="text-aviation-accent" />
      <div className="h-3 w-px bg-aviation-border" />
      <Stat label="GROUND" value={onGround} color="text-aviation-muted" />
      <div className="ml-auto flex items-center gap-2">
        {loading && <LoadingSpinner size="sm" />}
        {error && <span className="text-aviation-danger truncate max-w-[180px]">{error}</span>}
        {!error && lastUpdated && (
          <span className="text-aviation-dim">
            Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-aviation-dim">{label}</span>
      <span className={`font-semibold ${color}`}>{value.toLocaleString()}</span>
    </div>
  );
}
