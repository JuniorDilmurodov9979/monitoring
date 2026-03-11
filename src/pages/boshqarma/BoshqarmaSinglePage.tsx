import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  TeamOutlined,
  FileOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import api from "@/services/api/axios";

interface UserType {
  id: number;
  fio: string;
  lavozim: string;
  boshqarma_nomi: string;
  is_active: boolean;
}

interface HujjatType {
  id: number;
  nomi: string;
  obyekt_nomi: string;
  kategoriya_nomi: string;
  boshqarma_nomi: string;
  holat: string;
  holat_display: string;
  muddat: string;
  fayl_turi: string;
  is_kechikkan: boolean;
  yuklangan_vaqt: string;
}

type TabKey = "xodimlar" | "hujjatlar";

const HOLAT_CONFIG: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  tasdiqlandi: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-400",
    label: "Tasdiqlandi",
  },
  kutilmoqda: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-400",
    label: "Kutilmoqda",
  },
  rad_etildi: {
    bg: "bg-red-50",
    text: "text-red-500",
    dot: "bg-red-400",
    label: "Rad etildi",
  },
};

const BoshqarmaSinglePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>("xodimlar");

  const [users, setUsers] = useState<UserType[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [hujjatlar, setHujjatlar] = useState<HujjatType[]>([]);
  const [hujjatlarLoading, setHujjatlarLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await api.get(`auth/users/?boshqarma=${id}`);
      setUsers(res.data.results);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchHujjatlar = async () => {
    try {
      setHujjatlarLoading(true);
      const res = await api.get(
        `hujjatlar/boshqarma_hujjatlari/?boshqarma=${id}`,
      );
      setHujjatlar(res.data);
    } catch (error) {
      console.error("Error fetching hujjatlar:", error);
    } finally {
      setHujjatlarLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUsers();
      fetchHujjatlar();
    }
  }, [id]);

  const isLoading = activeTab === "xodimlar" ? usersLoading : hujjatlarLoading;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const getHolatConfig = (holat: string) =>
    HOLAT_CONFIG[holat] ?? {
      bg: "bg-slate-100",
      text: "text-slate-500",
      dot: "bg-slate-300",
      label: holat,
    };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Back + header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeftOutlined className="text-[10px]" />
          Boshqarmalar
        </button>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">
              Boshqarma #{id}
            </p>
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
              {activeTab === "xodimlar"
                ? "Xodimlar ro'yxati"
                : "Hujjatlar ro'yxati"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {users.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                <TeamOutlined className="text-[11px]" />
                {users.length} ta xodim
              </span>
            )}
            {hujjatlar.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                <FileOutlined className="text-[11px]" />
                {hujjatlar.length} ta hujjat
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
        {(
          [
            { key: "xodimlar", label: "Xodimlar", icon: <TeamOutlined /> },
            { key: "hujjatlar", label: "Hujjatlar", icon: <FileOutlined /> },
          ] as { key: TabKey; label: string; icon: React.ReactNode }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              activeTab === tab.key
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center items-center py-32">
          <Spin size="large" />
        </div>
      ) : activeTab === "xodimlar" ? (
        /* ── USERS TABLE ── */
        users.length === 0 ? (
          <EmptyState
            icon={<TeamOutlined />}
            text="Bu boshqarmada xodimlar yo'q"
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {["#", "F.I.O", "Lavozim", "Boshqarma", "Holati"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400"
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => navigate(`/users/${user.id}`)}
                    className="border-b border-slate-100 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors duration-100"
                  >
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-slate-400 tabular-nums">
                        {user.id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <UserOutlined className="text-slate-400 text-xs" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {user.fio}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600">
                        {user.lavozim}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-600">
                        {user.boshqarma_nomi}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {user.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Aktiv
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          Nofaol
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : /* ── HUJJATLAR TABLE ── */
      hujjatlar.length === 0 ? (
        <EmptyState
          icon={<FileDoneOutlined />}
          text="Bu boshqarmada hujjatlar yo'q"
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {[
                  "#",
                  "Nomi",
                  "Obyekt",
                  "Kategoriya",
                  "Fayl turi",
                  "Muddat",
                  "Holati",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hujjatlar.map((doc) => {
                const holat = getHolatConfig(doc.holat);
                return (
                  <tr
                    key={doc.id}
                    className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors duration-100"
                  >
                    {/* ID */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-slate-400 tabular-nums">
                        {doc.id}
                      </span>
                    </td>

                    {/* Nomi */}
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <FileOutlined className="text-slate-400 text-xs" />
                        </div>
                        <button
                          onClick={() => navigate(`/hujjatlar/${doc.id}`)}
                          className="text-sm text-start cursor-pointer hover:underline hover:text-slate-900 font-semibold text-slate-700 line-clamp-2"
                        >
                          {doc.nomi}
                        </button>
                      </div>
                    </td>

                    {/* Obyekt */}
                    <td className="px-4 py-3.5 max-w-[160px]">
                      <span className="text-sm text-slate-600 line-clamp-2">
                        {doc.obyekt_nomi}
                      </span>
                    </td>

                    {/* Kategoriya */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-600">
                        {doc.kategoriya_nomi}
                      </span>
                    </td>

                    {/* Fayl turi */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 font-mono">
                        {doc.fayl_turi}
                      </span>
                    </td>

                    {/* Muddat */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {doc.is_kechikkan && (
                          <ClockCircleOutlined className="text-red-400 text-xs" />
                        )}
                        <span
                          className={`text-xs font-medium tabular-nums ${
                            doc.is_kechikkan ? "text-red-500" : "text-slate-500"
                          }`}
                        >
                          {formatDate(doc.muddat)}
                        </span>
                      </div>
                    </td>

                    {/* Holati */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${holat.bg} ${holat.text}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${holat.dot}`}
                        />
                        {doc.holat_display}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ── Reusable empty state ── */
const EmptyState = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20 gap-3">
    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 text-xl">
      {icon}
    </div>
    <p className="text-sm text-slate-400 font-medium">{text}</p>
  </div>
);

export default BoshqarmaSinglePage;
