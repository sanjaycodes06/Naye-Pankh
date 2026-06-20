import { cn } from "@/utils/cn";

/**
 * Consistent page header used inside dashboard layouts.
 * Usage: <PageHeader title="Volunteers" subtitle="Manage all registered volunteers">
 *          <button>Action</button>
 *        </PageHeader>
 */
const PageHeader = ({ title, subtitle, children, className }) => (
  <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6", className)}>
    <div>
      <h1 className="text-2xl font-display font-bold text-ink-800">{title}</h1>
      {subtitle && <p className="text-sm text-ink-400 mt-0.5">{subtitle}</p>}
    </div>
    {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
  </div>
);

export default PageHeader;
