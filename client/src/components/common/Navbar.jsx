import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu, X, Leaf, Bell, ChevronDown,
  User, LayoutDashboard, LogOut, Settings,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authAPI } from "@/api/auth.api";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";

/* ── Logo ─────────────────────────────────────────────────────────────────── */
const Logo = () => (
  <Link to="/" className="flex items-center gap-2.5 group">
    <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-cent justify-center shadow-sm group-hover:bg-brand-600 transition-colors">
      <img src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=375,fit=crop,q=95/YKbL494Mv8Ip3qgy/logo-AVLW2LLWZkI8v845.png" alt="NayePankh" className="text-white" />
    </div>
    <div className="leading-none">
      <span className="block font-display font-bold text-base text-ink-800 group-hover:text-brand-600 transition-colors">
        NayePankh
      </span>
      <span className="block text-2xs text-ink-400 tracking-wider uppercase mt-0.5">Foundation</span>
    </div>
  </Link>
);

/* ── Public nav links ─────────────────────────────────────────────────────── */
const PUBLIC_LINKS = [
  { to: "/",        label: "Home" },
  { to: "/about",   label: "About" },
  { to: "/register",label: "Volunteer" },
];

/* ── Avatar dropdown ──────────────────────────────────────────────────────── */
const UserMenu = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isAdmin = ["admin", "superadmin"].includes(user?.role);
  const dashboardPath = isAdmin ? "/admin/dashboard" : "/volunteer/dashboard";

  const initial = user?.fullName?.charAt(0).toUpperCase() || "V";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-ink-100 transition-colors"
      >
        {user?.profilePhoto ? (
          <img src={user.profilePhoto} alt={user.fullName} className="w-8 h-8 rounded-lg object-cover" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white text-sm font-semibold">
            {initial}
          </div>
        )}
        <span className="text-sm font-medium text-ink-700 hidden sm:block max-w-[120px] truncate">
          {user?.fullName}
        </span>
        <ChevronDown size={14} className={cn("text-ink-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-card-lg border border-ink-100 py-1.5 z-50 animate-slide-up">
          {/* User info */}
          <div className="px-4 py-2.5 border-b border-ink-100 mb-1">
            <p className="text-sm font-semibold text-ink-800 truncate">{user?.fullName}</p>
            <p className="text-xs text-ink-400 truncate">{user?.email}</p>
            <span className={cn(
              "inline-block mt-1.5 px-2 py-0.5 rounded-full text-2xs font-medium",
              isAdmin ? "bg-purple-100 text-purple-700" : "bg-brand-100 text-brand-700"
            )}>
              {user?.role}
            </span>
          </div>

          <DropdownItem icon={LayoutDashboard} label="Dashboard" onClick={() => { navigate(dashboardPath); setOpen(false); }} />
          <DropdownItem icon={User}            label="My Profile" onClick={() => { navigate("/volunteer/profile"); setOpen(false); }} />
          {isAdmin && <DropdownItem icon={Settings} label="Admin Panel" onClick={() => { navigate("/admin/dashboard"); setOpen(false); }} />}

          <div className="border-t border-ink-100 mt-1 pt-1">
            <DropdownItem icon={LogOut} label="Sign out" onClick={() => { setOpen(false); onLogout(); }} danger />
          </div>
        </div>
      )}
    </div>
  );
};

const DropdownItem = ({ icon: Icon, label, onClick, danger }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left",
      danger
        ? "text-red-500 hover:bg-red-50"
        : "text-ink-700 hover:bg-ink-50"
    )}
  >
    <Icon size={15} />
    {label}
  </button>
);

/* ── Main Navbar ──────────────────────────────────────────────────────────── */
const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const { user, accessToken, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // swallow
    } finally {
      logout();
      navigate("/login");
      toast.success("Signed out successfully.");
    }
  };

  const isAdmin = ["admin", "superadmin"].includes(user?.role);

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full transition-all duration-300",
      scrolled
        ? "bg-white/95 backdrop-blur-md shadow-card border-b border-ink-100/80"
        : "bg-white border-b border-ink-100"
    )}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Left: Logo */}
        <Logo />

        {/* Center: Public links (desktop) */}
        {!accessToken && (
          <div className="hidden md:flex items-center gap-1">
            {PUBLIC_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  cn(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "text-brand-600 bg-brand-50"
                      : "text-ink-600 hover:text-ink-800 hover:bg-ink-50"
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Admin quick-links (desktop) */}
        {accessToken && isAdmin && (
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: "/admin/dashboard",  label: "Dashboard" },
              { to: "/admin/volunteers", label: "Volunteers" },
              { to: "/admin/tasks",      label: "Tasks" },
            ].map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn("px-3 py-1.5 rounded-xl text-sm font-medium transition-colors",
                    isActive ? "text-brand-600 bg-brand-50" : "text-ink-600 hover:bg-ink-50"
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}

        {/* Right: Auth actions */}
        <div className="flex items-center gap-2">
          {accessToken && user ? (
            <>
              {/* Notification bell */}
              <NavLink
                to="/volunteer/notifications"
                className="relative p-2 rounded-xl text-ink-500 hover:text-ink-700 hover:bg-ink-100 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {/* Unread dot — wire to store later */}
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
              </NavLink>
              <UserMenu user={user} onLogout={handleLogout} />
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/login" className="btn-ghost btn-sm">Sign in</Link>
              <Link to="/register" className="btn-primary btn-sm">Join us</Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden p-2 rounded-xl text-ink-500 hover:bg-ink-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-ink-100 animate-slide-up">
          <div className="px-4 py-3 space-y-1">
            {!accessToken && PUBLIC_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn("block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive ? "text-brand-600 bg-brand-50" : "text-ink-600 hover:bg-ink-50"
                  )
                }
              >
                {label}
              </NavLink>
            ))}

            {!accessToken && (
              <div className="flex gap-2 pt-2">
                <Link to="/login"    onClick={() => setMobileOpen(false)} className="btn-secondary btn-sm flex-1 justify-center">Sign in</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary  btn-sm flex-1 justify-center">Join us</Link>
              </div>
            )}

            {accessToken && (
              <>
                {isAdmin && (
                  <>
                    {[
                      { to: "/admin/dashboard",  label: "Admin Dashboard" },
                      { to: "/admin/volunteers", label: "Volunteers" },
                      { to: "/admin/tasks",      label: "Tasks" },
                    ].map(({ to, label }) => (
                      <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          cn("block px-4 py-2.5 rounded-xl text-sm font-medium",
                            isActive ? "text-brand-600 bg-brand-50" : "text-ink-600 hover:bg-ink-50"
                          )
                        }
                      >{label}</NavLink>
                    ))}
                  </>
                )}
                <button
                  onClick={() => { handleLogout(); setMobileOpen(false); }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
