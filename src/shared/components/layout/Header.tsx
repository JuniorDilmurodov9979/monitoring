import { useEffect, useRef, useState } from "react";
import api from "@/services/api/axios";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

type MeningTopshiriq = {
  id: number;
  band_raqami: number;
  mazmun: string;
  bayonnoma_raqami: string;
  holat: string;
  holat_display: string;
};

type KutilayotganHujjat = {
  id: number;
  nomi: string;
  boshqarma_nomi?: string;
  obyekt_nomi: string;
  holat: string;
  holat_display: string;
};

const Header = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [myTasks, setMyTasks] = useState<MeningTopshiriq[]>([]);
  const [pendingDocs, setPendingDocs] = useState<KutilayotganHujjat[]>([]);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;

    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const [tasksRes, docsRes] = await Promise.all([
          api.get("/bayonnomalar/topshiriqlar/mening/"),
          api.get("/hujjatlar/kutilmoqda/"),
        ]);

        if (!active) return;

        const taskData = Array.isArray(tasksRes.data)
          ? tasksRes.data
          : (tasksRes.data?.results ?? []);
        const docsData = Array.isArray(docsRes.data)
          ? docsRes.data
          : (docsRes.data?.results ?? []);

        setMyTasks(taskData);
        setPendingDocs(docsData);
      } catch (error) {
        console.error("Bildirishnomalarni olishda xatolik:", error);
      } finally {
        if (active) setLoadingNotifications(false);
      }
    };

    fetchNotifications();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!openNotifications) return;
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setOpenNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openNotifications]);

  const totalNotifications = myTasks.length + pendingDocs.length;

  const truncateText = (value: string, max = 52) => {
    if (!value) return "";
    if (value.length <= max) return value;
    return `${value.slice(0, max)}...`;
  };

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
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mt-5 mb-3">
          {/* Right Section */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setOpenNotifications((prev) => !prev)}
                className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-indigo-50 hover:to-purple-50 border border-gray-200 hover:border-indigo-200 transition-all duration-300 hover:shadow-md cursor-pointer"
                aria-label="Bildirishnomalar"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {totalNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center">
                    {totalNotifications > 99 ? "99+" : totalNotifications}
                  </span>
                )}
              </button>

              {openNotifications && (
                <div className="absolute right-0 mt-2 w-[350px] max-w-[calc(100vw-2rem)] bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg leading-8 font-semibold text-slate-800">
                      Bildirishnomalar
                    </h4>
                    <span className="min-w-6 h-6 rounded-xl bg-blue-50 text-blue-500 text-sm flex items-center justify-center px-2">
                      {totalNotifications}
                    </span>
                  </div>

                  {loadingNotifications ? (
                    <p className="text-sm text-slate-500 py-3">
                      Yuklanmoqda...
                    </p>
                  ) : (
                    <div className="max-h-[360px] overflow-y-auto pr-1 space-y-3">
                      {[...myTasks, ...pendingDocs].length === 0 ? (
                        <p className="text-sm text-slate-500 py-3">
                          Bildirishnoma yo'q
                        </p>
                      ) : (
                        <>
                          {myTasks.map((item) => (
                            <button
                              key={`task-${item.id}`}
                              onClick={() => {
                                setOpenNotifications(false);
                                navigate(`/topshiriqlar/${item.id}`);
                              }}
                              className="w-full text-left rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-base font-semibold text-slate-800 truncate">
                                    {truncateText(
                                      item.mazmun ||
                                      `Band #${item.band_raqami}`,
                                      18,
                                    )}
                                  </p>
                                  <p className="text-sm mt-1 text-slate-500">
                                    Bayonnoma {item.bayonnoma_raqami}
                                  </p>
                                </div>
                                <svg
                                  className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </div>
                              <div className="mt-1 flex justify-end">
                                <span className="inline-flex rounded-2xl px-2 py-0.5 text-sm leading-5 bg-blue-50 text-blue-600">
                                  Topshiriq
                                </span>
                              </div>
                            </button>
                          ))}

                          {pendingDocs.map((item) => (
                            <button
                              key={`doc-${item.id}`}
                              onClick={() => {
                                setOpenNotifications(false);
                                navigate(`/hujjatlar/${item.id}`);
                              }}
                              className="w-full text-left rounded-lg border border-slate-200 bg-white p-2 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="text-base font-semibold text-slate-800 truncate">
                                    {truncateText(item.nomi, 22)}
                                  </p>
                                  <p className="text-sm mt-1 text-slate-500 truncate">
                                    {item.obyekt_nomi ||
                                      item.boshqarma_nomi ||
                                      ""}
                                  </p>
                                </div>
                                <svg
                                  className="w-4 h-4 mt-0.5 text-slate-400 flex-shrink-0"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </div>
                              <div className="mt-1 flex justify-end">
                                <span className="inline-flex rounded-2xl px-2 py-0.5 text-sm leading-5 bg-amber-100 text-amber-700">
                                  {item.holat_display || "Kutilmoqda"}
                                </span>
                              </div>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

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
