interface Props {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = "✈", title, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <span className="text-4xl opacity-30">{icon}</span>
      <p className="text-sm font-medium text-aviation-muted">{title}</p>
      {description && (
        <p className="text-xs text-aviation-dim max-w-[200px]">{description}</p>
      )}
    </div>
  );
}
