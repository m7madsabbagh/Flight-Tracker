interface Props {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({ size = "md", label }: Props) {
  const dim = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" }[size];
  return (
    <div className="flex items-center gap-2">
      <div
        className={`${dim} animate-spin rounded-full border-2 border-aviation-dim border-t-aviation-accent`}
      />
      {label && <span className="text-sm text-aviation-muted">{label}</span>}
    </div>
  );
}
