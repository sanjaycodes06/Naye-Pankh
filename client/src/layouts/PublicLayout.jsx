import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useEffect } from "react";

/**
 * Wraps all public-facing pages (Home, About, Register, Login).
 * Sticky Navbar on top, Footer pinned to bottom.
 * Scrolls to top on every route change.
 */
const PublicLayout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="min-h-dvh flex flex-col bg-earth-50">
      <Navbar />
      <main className="flex-1 animate-fade-in">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
