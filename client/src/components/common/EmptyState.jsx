import { cn } from "@/utils/cn";

const EmptyState = ({ icon: Icon, title, description, action, className }) => (
  <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
    {Icon && (
      <div className="w-14 h-14 bg-ink-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={26} className="text-ink-300" />
      </div>
    )}
    <h3 className="text-base font-semibold text-ink-700 mb-1">{title}</h3>
    {description && <p className="text-sm text-ink-400 max-w-xs">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export default EmptyState;
