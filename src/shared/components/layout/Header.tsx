import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";
    const initials = `${first}${second}`.toUpperCase();
    if (initials) return initials;
    return name[0]?.toUpperCase() ?? "U";
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Right Section */}
          <div className="flex items-center gap-3 ml-auto">
            {/* Profile Button */}
            <button
              onClick={() => navigate("/profile")}
              className="group flex items-center cursor-pointer gap-3 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 border border-gray-200 hover:border-indigo-200 transition-all duration-300 hover:shadow-md"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm group-hover:scale-110 transition-transform">
                {getInitials(user?.fio)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {user?.fio || "Foydalanuvchi"}
                </p>
                <p className="text-xs text-gray-500">Profilni ko'rish</p>
              </div>
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 transition-colors hidden sm:block"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Logout Button */}
            <button
              onClick={async () => {
                await logout();
                navigate("/auth/login");
              }}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <svg
                className="w-5 h-5 group-hover:rotate-12 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Chiqish</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
