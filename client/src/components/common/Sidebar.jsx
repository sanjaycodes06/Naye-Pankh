import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ClipboardList, CalendarCheck, Award,
  Bell, User, Users, CheckSquare, BarChart2, Megaphone,
  Leaf, LogOut, ChevronRight,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useAuthStore } from "@/store/authStore";
import { authAPI } from "@/api/auth.api";
import toast from "react-hot-toast";

const VOLUNTEER_NAV = [
  { toa: "/volunteer/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { to: "/volunteer/tasks",        icon: ClipboardList,   label: "My Tasks" },
  { to: "/volunteer/attendance",   icon: CalendarCheck,   label: "Attendance" },
  { to: "/volunteer/certificates", icon: Award,           label: "Certificates" },
  { to: "/volunteer/notifications",icon: Bell,            label: "Notifications" },
  { to: "/volunteer/profile",      icon: User,            label: "My Profile" },
];

const ADMIN_NAV = [
  { to: "/admin/dashboard",    icon: BarChart2,      label: "Dashboard" },
  { to: "/admin/volunteers",   icon: Users,          label: "Volunteers" },
  { to: "/admin/tasks",        icon: CheckSquare,    label: "Tasks" },
  { to: "/admin/attendance",   icon: CalendarCheck,  label: "Attendance" },
  { to: "/admin/certificates", icon: Award,          label: "Certificates" },
  { to: "/admin/announcements",icon: Megaphone,      label: "Announcements" },
];

const NavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        isActive
          ? "bg-brand-500 text-white shadow-sm"
          : "text-ink-500 hover:bg-ink-100 hover:text-ink-800"
      )
    }
  >
    {({ isActive }) => (
      <>
        <Icon size={17} className={cn("shrink-0", isActive ? "text-white" : "text-ink-400 group-hover:text-ink-600")} />
        <span className="flex-1">{label}</span>
        <ChevronRight size={13} className={cn("opacity-0 group-hover:opacity-100 transition-opacity", isActive && "opacity-60")} />
      </>
    )}
  </NavLink>
);

const Sidebar = ({ role = "volunteer" }) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const navItems = role === "volunteer" ? VOLUNTEER_NAV : ADMIN_NAV;

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    logout();
    navigate("/login");
    toast.success("Signed out.");
  };

  return (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-ink-100 px-3 py-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 mb-6">
        <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-cent justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
          <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" alt="NayePankh" className="text-white" />
        </div>
        <div className="leading-none">
          <span className="block font-display font-bold text-sm text-ink-800">NayePankh</span>
          <span className="block text-2xs text-ink-400 uppercase tracking-wider mt-0.5">Foundation</span>
        </div>
      </div>

      {/* Section label */}
      <p className="px-3 mb-2 text-2xs font-semibold text-ink-300 uppercase tracking-widest">
        {role === "volunteer" ? "Volunteer Portal" : "Admin Panel"}
      </p>

      {/* Nav items */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto scrollbar-none">
        {navItems.map((item) => <NavItem key={item.to} {...item} />)}
      </nav>

      {/* User card at bottom */}
      <div className="mt-4 pt-4 border-t border-ink-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-ink-50 mb-2">
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.fullName} className="w-8 h-8 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-ink-800 truncate">{user?.fullName}</p>
            <p className="text-2xs text-ink-400 truncate">{user?.volunteerId || user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
