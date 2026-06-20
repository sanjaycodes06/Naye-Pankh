import { cn } from "@/utils/cn";

const STATUS_STYLES = {
  approved:  "bg-brand-100 text-brand-700",
  pending:   "bg-amber-100 text-amber-700",
  rejected:  "bg-red-100 text-red-700",
  suspended: "bg-ink-100 text-ink-500",
  open:       "bg-blue-100 text-blue-700",
  in_progress:"bg-amber-100 text-amber-700",
  completed:  "bg-brand-100 text-brand-700",
  cancelled:  "bg-ink-100 text-ink-500",
  present:    "bg-brand-100 text-brand-700",
  absent:     "bg-red-100 text-red-700",
  late:       "bg-amber-100 text-amber-700",
  excused:    "bg-purple-100 text-purple-700",
};

const STATUS_LABELS = {
  in_progress: "In Progress",
};

const StatusBadge = ({ status, className }) => {
  const styles = STATUS_STYLES[status] || "bg-ink-100 text-ink-600";
  const label  = STATUS_LABELS[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : "—");

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", styles, className)}>
      {label}
    </span>
  );
};

export default StatusBadge;
