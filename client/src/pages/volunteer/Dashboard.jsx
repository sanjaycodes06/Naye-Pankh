import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock, CheckSquare, Award, ClipboardList,
  ArrowRight, CalendarCheck, TrendingUp, AlertCircle,
  Megaphone, ChevronRight,
} from "lucide-react";
import { volunteerAPI } from "@/api/volunteer.api";
import { useAuthStore } from "@/store/authStore";
import { Skeleton } from "@/components/common/Loader";
import StatusBadge from "@/components/common/StatusBadge";
import { formatDate, timeAgo } from "@/utils/formatDate";
import toast from "react-hot-toast";

const C = { forest:"#1B3A2D", gold:"#C8923A", sage:"#7BAF8A", cream:"#F7F2E8", mist:"#FDFAF5" };

/* ── Stat card ─────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, accent, loading }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: `${accent}18` }}>
      <Icon size={20} style={{ color: accent }} strokeWidth={1.8} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      {loading
        ? <Skeleton className="h-7 w-16 mb-1" />
        : <p className="text-2xl font-bold text-gray-900" style={{ fontFamily:"'Fraunces',serif" }}>{value}</p>
      }
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ── Task row ──────────────────────────────────────────────────────── */
const TaskRow = ({ task }) => (
  <Link to={`/volunteer/tasks/${task._id}`}
    className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-colors group">
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0"
        style={{ background: task.priority === "urgent" ? "#EF4444" : task.priority === "high" ? C.gold : C.sage }} />
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {task.category} · Due {task.deadline ? formatDate(task.deadline) : "—"}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0 ml-3">
      <StatusBadge status={task.status} />
      <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
    </div>
  </Link>
);

/* ── Pending approval banner ───────────────────────────────────────── */
const PendingBanner = () => (
  <div className="rounded-2xl border px-5 py-4 flex items-start gap-3 mb-6"
    style={{ background:"#FFFBEB", borderColor:"#FDE68A" }}>
    <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
    <div>
      <p className="text-sm font-semibold text-amber-800">Your account is awaiting approval</p>
      <p className="text-xs text-amber-600 mt-0.5">
        An admin will review your application shortly. You'll receive an email once you're approved and can access tasks.
      </p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats]   = useState(null);
  const [tasks, setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [taskLoading, setTaskLoading] = useState(true);

  const isApproved = user?.status === "approved";

  useEffect(() => {
    if (!isApproved) { setLoading(false); setTaskLoading(false); return; }

    volunteerAPI.getDashboard()
      .then(({ data }) => setStats(data.data))
      .catch((err) => toast.error(err.response?.data?.message || "Couldn't load your dashboard stats."))
      .finally(() => setLoading(false));

    volunteerAPI.getTasks({ limit: 5, page: 1 })
      .then(({ data }) => setTasks(data.data.tasks || []))
      .catch((err) => toast.error(err.response?.data?.message || "Couldn't load your tasks."))
      .finally(() => setTaskLoading(false));
  }, [isApproved]);

  const firstName = user?.fullName?.split(" ")[0] || "Volunteer";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-400">{greeting}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5"
            style={{ fontFamily:"'Fraunces',Georgia,serif" }}>
            {firstName} 👋
          </h1>
          {user?.volunteerId && (
            <p className="text-xs text-gray-400 mt-1 font-mono">{user.volunteerId}</p>
          )}
        </div>
        {isApproved && (
          <Link to="/volunteer/tasks"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:gap-3"
            style={{ background:C.forest, color:C.cream }}>
            View tasks <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* ── Pending banner ── */}
      {!isApproved && <PendingBanner />}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Clock}        label="Hours Served"     accent={C.forest}
          value={loading ? "—" : stats?.totalHours ?? 0}
          sub="Total logged"             loading={loading && isApproved} />
        <StatCard icon={CheckSquare}  label="Tasks Done"       accent={C.gold}
          value={loading ? "—" : stats?.tasksCompleted ?? 0}
          sub="Completed"                loading={loading && isApproved} />
        <StatCard icon={ClipboardList} label="Active Tasks"    accent={C.sage}
          value={loading ? "—" : (stats?.taskStats?.open ?? 0) + (stats?.taskStats?.in_progress ?? 0)}
          sub="In progress"              loading={loading && isApproved} />
        <StatCard icon={Award}        label="Certificates"     accent="#8B5CF6"
          value={loading ? "—" : stats?.taskStats?.completed ?? 0}
          sub="Earned"                   loading={loading && isApproved} />
      </div>

      {/* ── Main grid ── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Tasks panel (2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Recent tasks</h2>
            <Link to="/volunteer/tasks" className="text-xs font-medium hover:underline" style={{ color:C.forest }}>
              See all
            </Link>
          </div>

          {!isApproved ? (
            <div className="px-5 py-12 text-center">
              <ClipboardList size={28} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Tasks unlock after approval.</p>
            </div>
          ) : taskLoading ? (
            <div className="p-4 space-y-2">
              {[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : tasks.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <ClipboardList size={28} className="mx-auto text-gray-200 mb-3" />
              <p className="text-sm text-gray-500 font-medium">No tasks assigned yet</p>
              <p className="text-xs text-gray-400 mt-1">Check back soon — the admin team will assign you shortly.</p>
            </div>
          ) : (
            <div className="p-2">
              {tasks.map(task => <TaskRow key={task._id} task={task} />)}
            </div>
          )}
        </div>

        {/* Side panel (1/3) */}
        <div className="space-y-4">

          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-4">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.fullName}
                  className="w-12 h-12 rounded-xl object-cover"/>
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{ background:C.forest }}>
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.fullName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {[
                ["Status",    <StatusBadge key="s" status={user?.status} />],
                ["City",      user?.city || "—"],
                ["Joined",    user?.joinedAt ? formatDate(user.joinedAt) : "—"],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-gray-400">{label}</span>
                  <span className="font-medium text-gray-700">{val}</span>
                </div>
              ))}
            </div>

            <Link to="/volunteer/profile"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              View profile <ArrowRight size={13} />
            </Link>
          </div>

          {/* Skills */}
          {user?.skills?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Your skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.slice(0, 6).map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ background:`${C.sage}20`, color:C.forest }}>
                    {s}
                  </span>
                ))}
                {user.skills.length > 6 && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-500">
                    +{user.skills.length - 6}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick links</h3>
            <div className="space-y-1">
              {[
                { to:"/volunteer/attendance",    icon:CalendarCheck, label:"Attendance log" },
                { to:"/volunteer/certificates",  icon:Award,         label:"My certificates" },
                { to:"/volunteer/notifications", icon:Megaphone,     label:"Notifications" },
              ].map(({ to, icon:Icon, label }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-colors group">
                  <Icon size={15} className="text-gray-400 group-hover:text-gray-600" />
                  {label}
                  <ChevronRight size={13} className="ml-auto text-gray-300 group-hover:text-gray-500" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent attendance ── */}
      {isApproved && stats?.recentAttendance?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="text-sm font-semibold text-gray-800">Recent attendance</h2>
            <Link to="/volunteer/attendance" className="text-xs font-medium hover:underline" style={{ color:C.forest }}>
              Full log
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentAttendance.map((rec) => (
              <div key={rec._id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-800">{rec.eventName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{rec.taskId?.title || "General"} · {formatDate(rec.date)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color:C.forest }}>{rec.hoursLogged}h</p>
                  <StatusBadge status={rec.status} className="mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
