// src/shared/components/layout/DashboardLayout.jsx
import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = () => {
  const location = useLocation();
  const contentRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location.pathname, location.search]);

  return (
   <div className="flex h-screen overflow-hidden">
  <Sidebar />

  <div className="flex flex-col flex-1 overflow-hidden">
    <Header />

    <main ref={contentRef} className="flex-1 overflow-auto p-6 min-h-0">
      <Outlet />
    </main>
  </div>
</div>
  );
};

export default DashboardLayout;
