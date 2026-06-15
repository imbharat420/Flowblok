import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <div className="max-w-[360px]">
        {Icon && (
          <span className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-lg border border-border bg-surface text-fg-muted">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <p className="text-[14px] font-medium text-fg">{title}</p>
        {description && <p className="mt-1 text-[13px] text-fg-muted">{description}</p>}
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}
