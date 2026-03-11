// src/shared/components/layout/DashboardLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar - Left */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1">
        {/* Header - Top */}
        <Header />

        {/* Main content - Center (Outlet renders DashboardPage, ProfilePage, etc.) */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>

        {/* Footer - Bottom */}
      </div>
    </div>
  );
};

export default DashboardLayout;
