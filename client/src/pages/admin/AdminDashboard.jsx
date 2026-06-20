import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users, User, ClipboardCheck, Award, Clock,
  ArrowRight, FileSpreadsheet, ChevronRight, UserPlus,
} from "lucide-react";
import { adminAPI } from "@/api/admin.api";
import StatCard from "@/components/admin/StatCard";
import StatusBadge from "@/components/common/StatusBadge";
import { Skeleton } from "@/components/common/Loader";
import { formatDate, timeAgo } from "@/utils/formatDate";
import { downloadFile, extractBlobErrorMessage } from "@/utils/downloadFile";
import toast from "react-hot-toast";

const C = { forest:"#1B3A2D", gold:"#C8923A", sage:"#7BAF8A", cream:"#F7F2E8" };

export default function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    adminAPI.getDashboardStats()
      .then(({ data }) => setStats(data.data))
      .catch(() => toast.error("Failed to load dashboard stats."))
      .finally(() => setLoading(false));
  }, []);

  const handleExportSummary = async () => {
    setExporting(true);
    try {
      const { data } = await adminAPI.exportSummary();
      downloadFile(data, `volunteer_summary_${new Date().toISOString().split("T")[0]}.csv`);
      toast.success("Summary downloaded.");
    } catch (err) {
      const message = await extractBlobErrorMessage(err, "Export failed. Please try again.");
      toast.error(message);
    } finally { setExporting(false); }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Fraunces', serif" }}>
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">An overview of the NayePankh volunteer programme</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportSummary} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60">
            {exporting
              ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              : <FileSpreadsheet size={15} />}
            Export summary
          </button>
          <Link to="/admin/volunteers"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:gap-3"
            style={{ background: C.forest, color: C.cream }}>
            Manage volunteers <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}           label="Approved volunteers" accent={C.forest}
          value={stats?.totalVolunteers ?? 0} loading={loading} />
        <StatCard icon={User}       label="Pending approvals"   accent={C.gold}
          value={stats?.pendingApprovals ?? 0} loading={loading} />
        <StatCard icon={ClipboardCheck}  label="Active tasks"        accent={C.sage}
          value={stats?.activeTasks ?? 0} loading={loading} />
        <StatCard icon={Award}           label="Certificates issued" accent="#8B5CF6"
          value={stats?.totalCertificates ?? 0} loading={loading} />
      </div>

      {/* ── Hours contributed banner ── */}
      <div className="rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap"
        style={{ background: C.forest }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${C.gold}22` }}>
            <Clock size={22} style={{ color: C.gold }} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider" style={{ color: `${C.sage}cc` }}>Total hours contributed</p>
            {loading ? (
              <Skeleton className="h-8 w-32 mt-1 bg-white/10" />
            ) : (
              <p className="text-3xl font-bold mt-0.5" style={{ fontFamily: "'Fraunces', serif", color: C.cream }}>
                {(stats?.totalHoursContributed ?? 0).toLocaleString("en-IN")}<span className="text-base ml-1 font-normal" style={{ color: `${C.sage}cc` }}>hours</span>
              </p>
            )}
          </div>
        </div>
        <p className="text-sm max-w-xs text-right" style={{ color: `${C.sage}cc` }}>
          Across {stats?.totalVolunteers ?? 0} approved volunteers since the programme began.
        </p>
      </div>

      {/* ── Recent registrations ── */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2.5">
            <UserPlus size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-800">Recent registrations</h2>
          </div>
          <Link to="/admin/volunteers?status=pending" className="text-xs font-medium hover:underline" style={{ color: C.forest }}>
            Review all pending
          </Link>
        </div>

        {loading ? (
          <div className="p-4 space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : !stats?.recentRegistrations?.length ? (
          <div className="px-5 py-12 text-center">
            <UserPlus size={28} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">No new registrations yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.recentRegistrations.map((r) => (
              <Link key={r._id} to={`/admin/volunteers/${r._id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/80 transition-colors group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: C.forest }}>
                    {r.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{r.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{r.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs text-gray-400 hidden sm:block">{timeAgo(r.createdAt)}</span>
                  <StatusBadge status={r.status} />
                  <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Quick action cards ── */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: "/admin/tasks/new",       icon: ClipboardCheck, label: "Create a task",      sub: "Assign work to volunteers" },
          { to: "/admin/attendance",      icon: Clock,          label: "Mark attendance",     sub: "Log hours for an event" },
          { to: "/admin/certificates",    icon: Award,          label: "Issue a certificate", sub: "Recognise a volunteer" },
        ].map(({ to, icon: Icon, label, sub }) => (
          <Link key={to} to={to}
            className="flex items-center gap-4 p-5 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-card transition-all group">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${C.sage}18` }}>
              <Icon size={19} style={{ color: C.forest }} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
            <ChevronRight size={15} className="ml-auto text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
