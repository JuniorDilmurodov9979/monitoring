import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/", icon: "⊞" },
  { label: "Hujjatlar", path: "/hujjatlar", icon: "📄" },
  { label: "Obyektlar", path: "/obyektlar", icon: "🏗" },
  { label: "Boshqarma", path: "/boshqarma", icon: "🏛" },
  { label: "Bayonnomalar", path: "/bayonnomalar", icon: "📋" },
  { label: "Topshiriqlar", path: "/topshiriqlar", icon: "✅" },
  { label: "Xodimlar", path: "/users", icon: "👥" },
  { label: "Chat xonalar", path: "/chats", icon: "💬" },
  { label: "Test Page 2", path: "/test2", icon: "🧪" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col justify-between w-[240px] min-h-screen bg-[#0f1117] border-r border-white/10 px-3 py-6 font-sans">
      
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 pb-6 mb-4 border-b border-white/10">
          <span className="w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-sm">
            LM
          </span>
          <span className="text-white font-bold text-lg tracking-tight">
            Loyiha Monitoring
          </span>
        </div>

        {/* Label */}
        <div className="text-[10px] font-semibold tracking-widest uppercase text-white/30 px-3 mb-2">
          Menyu
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map(({ label, path, icon }) => {
            const isActive = location.pathname === path;

            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`
                  relative flex items-center gap-3 w-full text-left
                  px-3 py-2 rounded-lg text-sm transition-all duration-150
                  ${
                    isActive
                      ? "bg-indigo-500/20 text-indigo-300 font-medium"
                      : "text-white/50 hover:bg-white/5 hover:text-white/80"
                  }
                `}
              >
                {/* Active Indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-indigo-500 rounded-r-sm" />
                )}

                <span className="w-[18px] text-center text-base opacity-80">
                  {icon}
                </span>
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/10 pt-3">
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-sm text-white/40 hover:bg-white/5 hover:text-white/70 transition-all duration-150"
        >
          <span className="w-[18px] text-center text-base">⚙️</span>
          Settings
        </button>
      </div>
    </div>
  );
};

export default Sidebar;