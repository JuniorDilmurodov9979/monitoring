import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Modal, Form, Input, Select, message } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  TeamOutlined,
  FileOutlined,
  FileDoneOutlined,
  ClockCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  WarningOutlined,
  MinusCircleOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import api from "@/services/api/axios";
import Can from "@/shared/components/guards/Can";

interface UserType {
  id: number;
  fio: string;
  lavozim: string;
  boshqarma_nomi: string;
  is_active: boolean;
  avatar?: string | null;
}

interface HujjatType {
  id: number;
  nomi: string;
  kategoriya?: number | null;
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

interface BoshqarmaType {
  id: number;
  nomi: string;
  qisqa_nomi: string;
}

interface StatistikaType {
  xodimlar_soni: number;
  hujjatlar_soni: number;
  jarimalar_soni: number;
  jami_minus: number;
  bajarilmagan_topshiriqlar: number;
}

interface BoshqarmaUpdatePayload {
  nomi: string;
  qisqa_nomi: string;
}

interface KategoriyaType {
  id: number;
  nomi: string;
  children?: KategoriyaType[];
}

interface ObyektType {
  id: number;
  nomi: string;
}

interface NewKategoriyaPayload {
  nomi: string;
  boshqarma: number;
  obyekt: number;
  tavsif?: string;
}

type TabKey = "xodimlar" | "hujjatlar";
type HujjatCategoryKey = "all" | number;

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

const STAT_CARDS = [
  {
    key: "xodimlar_soni" as keyof StatistikaType,
    label: "Xodimlar",
    icon: <TeamOutlined />,
    bg: "bg-blue-50",
    text: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    key: "hujjatlar_soni" as keyof StatistikaType,
    label: "Hujjatlar",
    icon: <FileOutlined />,
    bg: "bg-violet-50",
    text: "text-violet-600",
    iconBg: "bg-violet-100",
  },
  {
    key: "jarimalar_soni" as keyof StatistikaType,
    label: "Jarimalar",
    icon: <WarningOutlined />,
    bg: "bg-amber-50",
    text: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    key: "jami_minus" as keyof StatistikaType,
    label: "Jami minus",
    icon: <MinusCircleOutlined />,
    bg: "bg-red-50",
    text: "text-red-500",
    iconBg: "bg-red-100",
  },
  {
    key: "bajarilmagan_topshiriqlar" as keyof StatistikaType,
    label: "Bajarilmagan topshiriqlar",
    icon: <ExclamationCircleOutlined />,
    bg: "bg-orange-50",
    text: "text-orange-500",
    iconBg: "bg-orange-100",
  },
];

const BoshqarmaSinglePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>("xodimlar");
  const [activeHujjatCategory, setActiveHujjatCategory] =
    useState<HujjatCategoryKey>("all");

  const [users, setUsers] = useState<UserType[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [hujjatlar, setHujjatlar] = useState<HujjatType[]>([]);
  const [allHujjatlar, setAllHujjatlar] = useState<HujjatType[]>([]);
  const [hujjatlarLoading, setHujjatlarLoading] = useState(false);

  const [statistika, setStatistika] = useState<StatistikaType | null>(null);
  const [statistikaLoading, setStatistikaLoading] = useState(false);

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editFetchLoading, setEditFetchLoading] = useState(false);
  const [form] = Form.useForm<BoshqarmaUpdatePayload>();
  const [newKategoriyaOpen, setNewKategoriyaOpen] = useState(false);
  const [newKategoriyaLoading, setNewKategoriyaLoading] = useState(false);
  const [kategoriyalar, setKategoriyalar] = useState<KategoriyaType[]>([]);
  const [boshqarmalar, setBoshqarmalar] = useState<BoshqarmaType[]>([]);
  const [obyektlar, setObyektlar] = useState<ObyektType[]>([]);
  const [fetchError, setFetchError] = useState("");
  const [kategoriyaForm] = Form.useForm<NewKategoriyaPayload>();

  const fetchBoshqarmaDetail = async () => {
    try {
      setEditFetchLoading(true);
      const res = await api.get<BoshqarmaType>(`core/boshqarmalar/${id}/`);
      form.setFieldsValue({
        nomi: res.data.nomi,
        qisqa_nomi: res.data.qisqa_nomi,
      });
    } catch (error) {
      console.error("Error fetching boshqarma detail:", error);
      message.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setEditFetchLoading(false);
    }
  };

  const handleEditOpen = () => {
    setEditModalOpen(true);
    fetchBoshqarmaDetail();
  };

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
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data?.results ?? []);
      setAllHujjatlar(list);
      setHujjatlar(list);
    } catch (error) {
      console.error("Error fetching hujjatlar:", error);
    } finally {
      setHujjatlarLoading(false);
    }
  };

  const fetchKategoriyaHujjatlari = async (kategoriyaId: number) => {
    try {
      setHujjatlarLoading(true);
      const res = await api.get(
        `hujjatlar/kategoriya_hujjatlari/?kategoriya=${kategoriyaId}`,
      );
      const list = Array.isArray(res.data)
        ? res.data
        : (res.data?.results ?? []);
      setHujjatlar(list);
    } catch (error) {
      console.error("Error fetching kategoriya hujjatlari:", error);
      setHujjatlar([]);
    } finally {
      setHujjatlarLoading(false);
    }
  };

  const fetchStatistika = async () => {
    try {
      setStatistikaLoading(true);
      const res = await api.get<StatistikaType>(
        `core/boshqarmalar/${id}/statistika/`,
      );
      setStatistika(res.data);
    } catch (error) {
      console.error("Error fetching statistika:", error);
    } finally {
      setStatistikaLoading(false);
    }
  };

  const fetchKategoriyalar = async () => {
    if (!id) return;
    try {
      const { data } = await api.get(
        `hujjatlar/kategoriyalar/boshqarma_kategoriyalari/?boshqarma=${id}`,
      );
      setKategoriyalar(Array.isArray(data) ? data : (data.results ?? []));
      setFetchError("");
    } catch (e) {
      setFetchError("Kategoriyalarni yuklashda xato: " + e);
    }
  };

  const fetchBoshqarmalar = async () => {
    try {
      const { data } = await api.get("core/boshqarmalar/");
      setBoshqarmalar(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      /* silent */
    }
  };

  const fetchObyektlar = async () => {
    try {
      const { data } = await api.get("obyektlar/");
      setObyektlar(Array.isArray(data) ? data : (data.results ?? []));
    } catch {
      /* silent */
    }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      setEditLoading(true);
      await api.put(`core/boshqarmalar/${id}/`, values);
      message.success("Boshqarma muvaffaqiyatli yangilandi");
      setEditModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Error updating boshqarma:", error);
      message.error("Yangilashda xatolik yuz berdi");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`core/boshqarmalar/${id}/`);
      message.success("Boshqarma muvaffaqiyatli o'chirildi");
      navigate("/boshqarma");
    } catch (error) {
      console.error("Error deleting boshqarma:", error);
      message.error("O'chirishda xatolik yuz berdi");
    }
  };

  const handleEditCancel = () => {
    setEditModalOpen(false);
    form.resetFields();
  };

  const handleOpenNewKategoriya = () => {
    setNewKategoriyaOpen(true);
    Promise.all([fetchBoshqarmalar(), fetchObyektlar()]);
    if (id) {
      kategoriyaForm.setFieldValue("boshqarma", Number(id));
    }
  };

  const handleCreateKategoriya = async () => {
    try {
      const values = await kategoriyaForm.validateFields();
      setNewKategoriyaLoading(true);
      await api.post("hujjatlar/kategoriyalar/", {
        nomi: values.nomi?.trim(),
        boshqarma: Number(values.boshqarma),
        obyekt: Number(values.obyekt),
        tavsif: values.tavsif ?? "",
      });
      message.success("Kategoriya muvaffaqiyatli qo'shildi");
      setNewKategoriyaOpen(false);
      kategoriyaForm.resetFields();
      setActiveHujjatCategory("all");
      fetchHujjatlar();
      fetchKategoriyalar();
    } catch (error: any) {
      if (error?.errorFields) return;
      message.error("Kategoriya qo'shishda xatolik yuz berdi");
    } finally {
      setNewKategoriyaLoading(false);
    }
  };

  const handleCloseNewKategoriya = () => {
    setNewKategoriyaOpen(false);
    kategoriyaForm.resetFields();
    setFetchError("");
  };

  useEffect(() => {
    if (id) {
      fetchUsers();
      fetchHujjatlar();
      fetchStatistika();
      fetchKategoriyalar();
    }
  }, [id]);

  const isLoading = activeTab === "xodimlar" ? usersLoading : hujjatlarLoading;

  const flattenKategoriyalar = (arr: KategoriyaType[]): KategoriyaType[] =>
    arr.flatMap((item) => [{ id: item.id, nomi: item.nomi }]);

  const hujjatCategories = flattenKategoriyalar(kategoriyalar).sort((a, b) =>
    a.nomi.localeCompare(b.nomi, "uz"),
  );

  // keep active category valid when data changes / tab changes
  useEffect(() => {
    if (activeTab !== "hujjatlar") return;
    if (activeHujjatCategory === "all") return;
    if (hujjatCategories.some((item) => item.id === activeHujjatCategory))
      return;
    setActiveHujjatCategory("all");
  }, [activeTab, activeHujjatCategory, hujjatCategories]);

  useEffect(() => {
    if (activeTab !== "hujjatlar") return;
    if (activeHujjatCategory === "all") {
      setHujjatlar(allHujjatlar);
      return;
    }
    fetchKategoriyaHujjatlari(activeHujjatCategory);
  }, [activeTab, activeHujjatCategory, allHujjatlar]);

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
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
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
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
              {activeTab === "xodimlar"
                ? "Xodimlar ro'yxati"
                : "Hujjatlar ro'yxati"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Edit button */}
            <button
              onClick={handleEditOpen}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
            >
              <EditOutlined className="text-[11px]" />
              Tahrirlash
            </button>
            <Can action="canDelete">
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-full transition-colors cursor-pointer"
              >
                <DeleteOutlined className="text-[11px]" />
                O'chirish
              </button>
            </Can>
          </div>
        </div>
      </div>

      {/* ── STATISTIKA CARDS ── */}
      <div className="mb-6">
        {statistikaLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spin size="small" />
          </div>
        ) : statistika ? (
          <div className="grid grid-cols-5 gap-3">
            {STAT_CARDS.map((card) => (
              <div
                key={card.key}
                className={`${card.bg} rounded-2xl px-4 py-4 flex items-center gap-3 border border-white shadow-sm`}
              >
                <div
                  className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center flex-shrink-0 ${card.text} text-base`}
                >
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 leading-none mb-1 truncate">
                    {card.label}
                  </p>
                  <p className={`text-xl font-bold leading-none ${card.text}`}>
                    {statistika[card.key]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
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
                          {user.avatar ? (
                            <img
                              className="rounded-full w-full h-full"
                              src={user.avatar.replace("http", "https")}
                            />
                          ) : (
                            <UserOutlined className="text-slate-400 text-xs" />
                          )}
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
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            {/* category menu */}
            <div className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit shadow-sm">
              <button
                onClick={() => setActiveHujjatCategory("all")}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  activeHujjatCategory === "all"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                Hammasi
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                    activeHujjatCategory === "all"
                      ? "bg-white/15 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {allHujjatlar.length}
                </span>
              </button>

              {hujjatCategories.map((cat) => {
                const count = allHujjatlar.filter(
                  (d) => d.kategoriya_nomi === cat.nomi,
                ).length;
                const isActive = activeHujjatCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveHujjatCategory(cat.id)}
                    className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isActive
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {cat.nomi}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleOpenNewKategoriya}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <PlusOutlined className="text-[11px]" />
              Yangi kategoriya
            </button>
          </div>

          {hujjatlar.length === 0 ? (
            <EmptyState
              icon={<FileDoneOutlined />}
              text="Ushbu kategoriyada hujjatlar topilmadi"
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
                        className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors duration-100 cursor-pointer"
                        onClick={() => navigate(`/hujjatlar/${doc.id}`)}
                      >
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-medium text-slate-400 tabular-nums">
                            {doc.id}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 max-w-[220px]">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <FileOutlined className="text-slate-400 text-xs" />
                            </div>
                            <button className="text-sm text-start cursor-pointer hover:underline hover:text-slate-900 font-semibold text-slate-700 line-clamp-2">
                              {doc.nomi}
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 max-w-[160px]">
                          <span className="text-sm text-slate-600 line-clamp-2">
                            {doc.obyekt_nomi}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-600">
                            {doc.kategoriya_nomi}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 font-mono">
                            {doc.fayl_turi}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {doc.is_kechikkan && (
                              <ClockCircleOutlined className="text-red-400 text-xs" />
                            )}
                            <span
                              className={`text-xs font-medium tabular-nums ${
                                doc.is_kechikkan
                                  ? "text-red-500"
                                  : "text-slate-500"
                              }`}
                            >
                              {formatDate(doc.muddat)}
                            </span>
                          </div>
                        </td>
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
      )}

      {/* ── EDIT MODAL ── */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
              <EditOutlined className="text-slate-500 text-xs" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              Boshqarmani tahrirlash
            </span>
          </div>
        }
        open={editModalOpen}
        onCancel={handleEditCancel}
        onOk={handleEditSubmit}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={editLoading}
        okButtonProps={{
          className: "bg-slate-800 hover:bg-slate-700 border-slate-800",
        }}
        width={440}
        centered
      >
        <Spin spinning={editFetchLoading}>
          <Form
            form={form}
            layout="vertical"
            className="mt-4"
            requiredMark={false}
          >
            <Form.Item
              name="nomi"
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Nomi
                </span>
              }
              rules={[{ required: true, message: "Nomi kiritilishi shart" }]}
            >
              <Input
                placeholder="Boshqarma nomini kiriting"
                className="rounded-lg text-sm"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="qisqa_nomi"
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Qisqa nomi
                </span>
              }
              rules={[
                { required: true, message: "Qisqa nomi kiritilishi shart" },
              ]}
            >
              <Input
                placeholder="Qisqa nomini kiriting"
                className="rounded-lg text-sm"
                size="large"
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2 pb-1">
            <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center">
              <PlusOutlined className="text-indigo-500 text-xs" />
            </div>
            <span className="text-sm font-semibold text-slate-700">
              Yangi kategoriya
            </span>
          </div>
        }
        open={newKategoriyaOpen}
        onCancel={handleCloseNewKategoriya}
        onOk={handleCreateKategoriya}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={newKategoriyaLoading}
        okButtonProps={{
          className: "bg-indigo-500 hover:bg-indigo-600 border-indigo-500",
        }}
        width={460}
        centered
        destroyOnClose
      >
        <Form
          form={kategoriyaForm}
          layout="vertical"
          className="mt-4"
          requiredMark={false}
        >
          <Form.Item
            name="nomi"
            label={
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Nomi
              </span>
            }
            rules={[{ required: true, message: "Nomi kiritilishi shart" }]}
          >
            <Input
              placeholder="Kategoriya nomini kiriting"
              className="rounded-lg text-sm"
            />
          </Form.Item>

          <Form.Item
            name="boshqarma"
            label={
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Boshqarma
              </span>
            }
            rules={[{ required: true, message: "Boshqarma tanlanishi shart" }]}
          >
            <Select
              placeholder="Boshqarmani tanlang"
              showSearch
              optionFilterProp="label"
              options={boshqarmalar.map((b) => ({
                value: b.id,
                label: b.nomi,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="obyekt"
            label={
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Obyekt
              </span>
            }
            rules={[{ required: true, message: "Obyekt tanlanishi shart" }]}
          >
            <Select
              placeholder="Obyektni tanlang"
              showSearch
              optionFilterProp="label"
              options={obyektlar.map((o) => ({ value: o.id, label: o.nomi }))}
            />
          </Form.Item>

          <Form.Item
            name="tavsif"
            label={
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Tavsif
              </span>
            }
          >
            <Input.TextArea rows={3} placeholder="Ixtiyoriy tavsif" />
          </Form.Item>

          {fetchError ? (
            <p className="text-xs text-red-500 -mt-1 mb-0">{fetchError}</p>
          ) : null}
        </Form>
      </Modal>
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
