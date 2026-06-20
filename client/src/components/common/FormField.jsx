import { cn } from "@/utils/cn";

/**
 * Reusable labelled input/select/textarea with inline error.
 * Keeps form markup DRY across all pages.
 */
const FormField = ({
  label, name, type = "text", value, onChange, error,
  placeholder, required, disabled, children, hint,
  as: Tag = "input", rows, className,
}) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    {label && (
      <label htmlFor={name} className="text-sm font-medium text-ink-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
    )}
    {hint && <p className="text-xs text-ink-400 -mt-1">{hint}</p>}

    {children ? (
      children
    ) : Tag === "select" ? (
      <select
        id={name} name={name} value={value} onChange={onChange}
        disabled={disabled} required={required}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border bg-white text-sm text-ink-800",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
          "disabled:bg-ink-50 disabled:text-ink-400",
          error ? "border-red-400 focus:ring-red-400" : "border-ink-200"
        )}
      >
        {children}
      </select>
    ) : Tag === "textarea" ? (
      <textarea
        id={name} name={name} value={value} onChange={onChange}
        placeholder={placeholder} disabled={disabled} required={required} rows={rows || 3}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border bg-white text-sm text-ink-800 resize-none",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
          "disabled:bg-ink-50 disabled:text-ink-400",
          error ? "border-red-400 focus:ring-red-400" : "border-ink-200"
        )}
      />
    ) : (
      <input
        id={name} name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder} disabled={disabled} required={required}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl border bg-white text-sm text-ink-800",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent",
          "disabled:bg-ink-50 disabled:text-ink-400",
          error ? "border-red-400 focus:ring-red-400" : "border-ink-200"
        )}
      />
    )}

    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

export default FormField;
