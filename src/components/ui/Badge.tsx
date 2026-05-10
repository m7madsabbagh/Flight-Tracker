interface Props {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "accent";
}

const VARIANTS = {
  default: "bg-aviation-dim text-aviation-text",
  success: "bg-aviation-highlight/20 text-aviation-highlight",
  warning: "bg-aviation-warning/20 text-aviation-warning",
  danger: "bg-aviation-danger/20 text-aviation-danger",
  accent: "bg-aviation-accent/20 text-aviation-accent",
};

export function Badge({ children, variant = "default" }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-mono font-medium ${VARIANTS[variant]}`}
    >
      {children}
    </span>
  );
}
