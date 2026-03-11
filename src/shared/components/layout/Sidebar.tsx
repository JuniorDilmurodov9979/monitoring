import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Landmark,
  ClipboardList,
  CheckSquare,
  Users,
  MessageSquare,
  Pin,
  Banknote,
} from "lucide-react";

const navItems = [
  { label: "Bosh sahifa", path: "/", icon: LayoutDashboard },
  { label: "Hujjatlar", path: "/hujjatlar", icon: FileText },
  { label: "Obyektlar", path: "/obyekt", icon: Building2 },
  { label: "Boshqarma", path: "/boshqarma", icon: Landmark },
  { label: "Bayonnomalar", path: "/bayonnomalar", icon: ClipboardList },
  { label: "Topshiriqlar", path: "/topshiriqlar", icon: CheckSquare },
  { label: "Xodimlar", path: "/users", icon: Users },
  { label: "Chat xonalar", path: "/chats", icon: MessageSquare },
  { label: "Talablar", path: "/talablar", icon: Pin },
  { label: "Jarimalar", path: "/jarimalar", icon: Banknote },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col justify-between w-[240px] min-h-screen bg-[#0f1117] border-r border-white/10 px-3 py-6 font-sans">
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 pb-6 mb-4 border-b border-white/10">
          <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-bold">
            LM
          </span>
          <span className="text-white font-semibold text-lg tracking-tight">
            Loyiha Monitoring
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map(({ label, path, icon: Icon }) => {
            const isActive =
              path === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(path);

            return (
              <Link
                key={path}
                to={path}
                className={`
                  relative flex items-center gap-3 w-full
                  px-3 py-2.5 rounded-lg text-sm transition-all duration-150
                  ${
                    isActive
                      ? "bg-indigo-500/15 text-indigo-400 font-medium"
                      : "text-white/50 hover:bg-white/5 hover:text-white/90"
                  }
                `}
              >
                {/* Active Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-indigo-500 rounded-r-sm" />
                )}

                <Icon size={18} className="opacity-80" />

                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 pb-0 border-t border-white/10">
        <div className="text-xs text-gray-400">© 2026 Loyiha Monitoring</div>
        <div className="text-[11px] mt-1 font-semibold tracking-wide text-indigo-400">
          Ko'prikqurilish AJ
        </div>
      </footer>
    </div>
  );
};

export default Sidebar;
