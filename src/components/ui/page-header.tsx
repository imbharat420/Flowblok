export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-fg-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
