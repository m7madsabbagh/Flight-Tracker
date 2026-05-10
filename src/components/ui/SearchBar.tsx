"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search callsign or ICAO24…" }: Props) {
  return (
    <div className="relative flex items-center">
      <svg
        className="absolute left-3 h-4 w-4 text-aviation-muted pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-aviation-border bg-aviation-card pl-9 pr-3 py-2 text-sm text-aviation-text placeholder-aviation-muted outline-none focus:border-aviation-accent focus:ring-1 focus:ring-aviation-accent transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-2 p-1 text-aviation-muted hover:text-aviation-text"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  );
}
