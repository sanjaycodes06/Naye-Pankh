import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/common/Sidebar";
import { cn } from "@/utils/cn";

/**
 * Shell for all admin pages.
 * Identical structure to VolunteerLayout but passes role="admin"
 * to the Sidebar so it renders admin navigation links.
 */
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="min-h-dvh flex bg-earth-50">

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 z-30">
        <Sidebar role="admin" />
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden animate-slide-in">
            <Sidebar role="admin" />
          </div>
        </>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-ink-100 px-4 h-14 flex items-center gap-3 shadow-card">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-lg text-ink-500 hover:bg-ink-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <span className="font-display font-semibold text-ink-800 text-sm">Admin Panel</span>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
