import { cn } from "@/utils/cn";

/** Full-page loading spinner shown during auth bootstrap */
export const PageLoader = () => (
  <div className="fixed inset-0 bg-earth-50 flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-brand-100 border-t-brand-500 animate-spin" />
      <span className="text-sm text-ink-400 font-body">Loading...</span>
    </div>
  </div>
);

/** Inline spinner for buttons / sections */
export const Spinner = ({ size = "sm", className }) => {
  const sizes = { xs: "w-3 h-3", sm: "w-4 h-4", md: "w-6 h-6", lg: "w-8 h-8" };
  return (
    <span
      className={cn(
        "inline-block rounded-full border-2 border-current border-t-transparent animate-spin",
        sizes[size],
        className
      )}
      aria-label="Loading"
    />
  );
};

/** Skeleton shimmer block */
export const Skeleton = ({ className }) => (
  <div className={cn("animate-pulse bg-ink-100 rounded-xl", className)} />
);
