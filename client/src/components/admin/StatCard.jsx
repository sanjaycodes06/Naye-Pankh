import { Skeleton } from "@/components/common/Loader";

/**
 * Dashboard statistic card. Trend is optional — only shown when provided,
 * since not every metric has a meaningful "up/down" reading.
 */
const StatCard = ({ icon: Icon, label, value, accent, loading, trend }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${accent}15` }}>
        <Icon size={18} style={{ color: accent }} strokeWidth={1.8} />
      </div>
      {trend && (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend.positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
          {trend.positive ? "+" : ""}{trend.value}
        </span>
      )}
    </div>
    {loading ? (
      <Skeleton className="h-8 w-20 mb-1" />
    ) : (
      <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </p>
    )}
    <p className="text-xs font-medium text-gray-400 mt-1">{label}</p>
  </div>
);

export default StatCard;
