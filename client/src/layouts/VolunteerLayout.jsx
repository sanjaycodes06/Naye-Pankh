import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/common/Sidebar";
import Navbar from "@/components/common/Navbar";
import { cn } from "@/utils/cn";

/**
 * Shell for all authenticated volunteer pages.
 * Desktop: fixed left sidebar + scrollable content area.
 * Mobile: collapsible drawer sidebar + top navbar.
 */
const VolunteerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="min-h-dvh flex bg-earth-50">

      {/* ── Desktop sidebar ──────────────────────────── */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 z-30">
        <Sidebar role="volunteer" />
      </div>

      {/* ── Mobile sidebar drawer ─────────────────────── */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden animate-slide-in">
            <Sidebar role="volunteer" />
          </div>
        </>
      )}

      {/* ── Main content ──────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-ink-100 px-4 h-14 flex items-center gap-3 shadow-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-display font-semibold text-ink-800 text-sm">NayePankh</span>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VolunteerLayout;
