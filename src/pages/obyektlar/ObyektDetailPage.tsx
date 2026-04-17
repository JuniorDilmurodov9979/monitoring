import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin, message } from "antd";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import {
  ArrowLeftOutlined,
  EditOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  BankOutlined,
  FileTextOutlined,
  PaperClipOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import Can from "@/shared/components/guards/Can";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Obyekt {
  id: number;
  nomi: string;
  manzil: string;
  buyurtmachi: string;
  pudratchi: string;
  holat: "rejada" | "jarayonda" | "tugatilgan" | "to'xtatilgan";
  reja_foizi: number;
  bajarilish_foizi: number;
  boshlanish_sanasi: string;
  tugash_sanasi: string;
  shartnoma_summasi: string;
  sarflangan_summa: string;
  masul_xodim: number;
  masul_xodim_fio?: string;
  tavsif: string;
  rasm?: string;
}

interface Hujjat {
  id: number;
  nomi: string;
  obyekt: number;
  obyekt_nomi: string;
  kategoriya: number;
  kategoriya_nomi: string;
  kategoriya_full_path: string;
  boshqarma: number;
  boshqarma_nomi: string;
  yuklovchi: number;
  yuklovchi_fio: string;
  holat: "kutilmoqda" | "tasdiqlangan" | "rad_etilgan";
  holat_display: string;
  muddat: string;
  fayl_turi: string;
  is_kechikkan: boolean;
  yuklangan_vaqt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HOLAT_CONFIG = {
  rejada: {
    label: "Rejada",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-500",
    bar: "bg-slate-400",
  },
  jarayonda: {
    label: "Jarayonda",
    dot: "bg-blue-400",
    badge: "bg-blue-50 text-blue-600",
    bar: "bg-blue-400",
  },
  tugatilgan: {
    label: "Tugatilgan",
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-600",
    bar: "bg-emerald-400",
  },
  "to'xtatilgan": {
    label: "To'xtatilgan",
    dot: "bg-rose-400",
    badge: "bg-rose-50 text-rose-500",
    bar: "bg-rose-400",
  },
} as const;

const HUJJAT_HOLAT_CONFIG = {
  kutilmoqda: {
    badge: "bg-amber-50 text-amber-600",
    dot: "bg-amber-400",
  },
  tasdiqlangan: {
    badge: "bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-400",
  },
  rad_etilgan: {
    badge: "bg-rose-50 text-rose-500",
    dot: "bg-rose-400",
  },
} as const;

// ─── Small UI helpers ─────────────────────────────────────────────────────────

const SectionDivider = ({ title }: { title: string }) => (
  <div className="flex items-center gap-3 my-7 mt-3">
    <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400 whitespace-nowrap">
      {title}
    </span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
      {label}
    </p>
    <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
      {icon && <span className="text-slate-300 text-xs">{icon}</span>}
      <span>{value || <span className="text-slate-300">—</span>}</span>
    </div>
  </div>
);

const ProgressBar = ({
  label,
  value,
  color,
  trackColor,
}: {
  label: string;
  value: number;
  color: string;
  trackColor: string;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
        {label}
      </p>
      <span className="text-sm font-bold tabular-nums" style={{ color }}>
        {value}%
      </span>
    </div>
    <div className={`h-2.5 rounded-full ${trackColor} overflow-hidden`}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
    <div className="flex justify-between text-[10px] text-slate-300 mt-1">
      <span>0%</span>
      <span>100%</span>
    </div>
  </div>
);

const FileTypeBadge = ({ type }: { type: string }) => {
  const colorMap: Record<string, string> = {
    PDF: "bg-rose-50 text-rose-500 border-rose-100",
    JPEG: "bg-blue-50 text-blue-500 border-blue-100",
    JPG: "bg-blue-50 text-blue-500 border-blue-100",
    PNG: "bg-violet-50 text-violet-500 border-violet-100",
    DOCX: "bg-sky-50 text-sky-500 border-sky-100",
    XLSX: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  const cls =
    colorMap[type?.toUpperCase()] ??
    "bg-slate-50 text-slate-400 border-slate-100";
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${cls}`}
    >
      {type}
    </span>
  );
};

const formatSum = (val: string | number) => {
  const n = Number(val || 0);
  if (!n) return "—";
  return n.toLocaleString("ru-RU") + " so'm";
};

const formatDate = (val: string) => {
  if (!val) return "—";
  const [y, m, d] = val.split("-");
  return `${d}.${m}.${y}`;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ObyektDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [data, setData] = useState<Obyekt | null>(null);
  const [loading, setLoading] = useState(true);
  const [hujjatlar, setHujjatlar] = useState<Hujjat[]>([]);
  const [hujjatLoading, setHujjatLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [obyektRes, xodimRes] = await Promise.all([
          api.get(`${API_ENDPOINTS.OBYEKTLAR.LIST}${id}/`),
          api.get("/auth/users/").catch(() => ({ data: { results: [] } })),
        ]);
        console.log(obyektRes?.data);

        const d = obyektRes.data;
        const xodimlar: { id: number; fio: string }[] =
          xodimRes.data.results ?? [];
        const masul = xodimlar.find((x) => x.id === d.masul_xodim);
        setData({ ...d, masul_xodim_fio: masul?.fio });
      } catch (err) {
        console.error(err);
        message.error("Ma'lumot yuklanmadi");
      } finally {
        setLoading(false);
      }

      // Fetch hujjatlar separately so it doesn't block the main data
      try {
        setHujjatLoading(true);
        const hujjatRes = await api.get(
          `/hujjatlar/obyekt_hujjatlari/?obyekt=${id}`,
        );
        setHujjatlar(hujjatRes.data ?? []);
      } catch {
        // silently ignore
      } finally {
        setHujjatLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 text-slate-400 text-sm">
        Obyekt topilmadi
      </div>
    );
  }

  const holat = HOLAT_CONFIG[data.holat] ?? HOLAT_CONFIG["rejada"];

  const spendPct =
    data.shartnoma_summasi && data.sarflangan_summa
      ? Math.min(
          Math.round(
            (Number(data.sarflangan_summa) / Number(data.shartnoma_summasi)) *
              100,
          ),
          100,
        )
      : 0;

  const daysLeft = (() => {
    if (!data.tugash_sanasi) return null;
    const diff = Math.ceil(
      (new Date(data.tugash_sanasi).getTime() - Date.now()) /
        (1000 * 60 * 60 * 24),
    );
    return diff;
  })();

  console.log(data);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
      {/* ── Header ── */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors mb-3 cursor-pointer"
        >
          <ArrowLeftOutlined className="text-[10px]" />
          Obyektlar
        </button>

        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
              {data.nomi}
            </h1>
            {data.manzil && (
              <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 text-sm">
                <EnvironmentOutlined className="text-xs" />
                {data.manzil}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${holat.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${holat.dot}`} />
              {holat.label}
            </span>

            <Can action="canEditObyekt" >
              <button
                type="button"
                onClick={() => navigate(`/obyekt/${id}/edit`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-200 transition-all duration-200 cursor-pointer"
              >
                <EditOutlined className="text-xs" />
                Tahrirlash
              </button>
            </Can>
          </div>
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-0">
        {/* ── Rasm ── */}
        {data.rasm && (
          <>
            <SectionDivider title="Rasm" />
            <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 h-44 sm:h-56 ">
              <img
                src={data.rasm.replace(/^http:/, "https:")}
                alt={data.nomi}
                className="w-full h-full object-cover object-center"
              />
            </div>
          </>
        )}

        {/* ── Asosiy ma'lumotlar ── */}
        <SectionDivider title="Asosiy ma'lumotlar" />
        <div className="grid md:grid-cols-2 gap-5">
          <InfoRow
            label="Buyurtmachi"
            icon={<BankOutlined />}
            value={data.buyurtmachi}
          />
          <InfoRow
            label="Pudratchi"
            icon={<TeamOutlined />}
            value={data.pudratchi}
          />
          <InfoRow
            label="Mas'ul xodim"
            icon={<UserOutlined />}
            value={data.masul_xodim_fio ? `${data.masul_xodim_fio}` : null}
          />
          <InfoRow
            label="Manzil"
            icon={<EnvironmentOutlined />}
            value={data.manzil}
          />
        </div>

        {/* ── Muddatlar ── */}
        <SectionDivider title="Muddatlar" />
        <div className="grid md:grid-cols-3 gap-5">
          <InfoRow
            label="Boshlanish sanasi"
            icon={<CalendarOutlined />}
            value={formatDate(data.boshlanish_sanasi)}
          />
          <InfoRow
            label="Tugash sanasi"
            icon={<CalendarOutlined />}
            value={formatDate(data.tugash_sanasi)}
          />
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
              Qolgan vaqt
            </p>
            {daysLeft === null ? (
              <span className="text-slate-300 text-sm font-medium">—</span>
            ) : daysLeft < 0 ? (
              <span className="text-sm font-semibold text-rose-500">
                {Math.abs(daysLeft)} kun o'tgan
              </span>
            ) : daysLeft === 0 ? (
              <span className="text-sm font-semibold text-amber-500">
                Bugun
              </span>
            ) : (
              <span className="text-sm font-semibold text-emerald-600">
                {daysLeft} kun qoldi
              </span>
            )}
          </div>
        </div>

        {/* ── Bajarilish holati ── */}
        <SectionDivider title="Bajarilish holati" />
        <div className="grid md:grid-cols-2 gap-8">
          <ProgressBar
            label="Bajarilish foizi"
            value={data.bajarilish_foizi}
            color="#3b82f6"
            trackColor="bg-blue-50"
          />
          <ProgressBar
            label="Reja foizi"
            value={data.reja_foizi}
            color="#a855f7"
            trackColor="bg-purple-50"
          />
        </div>

        {/* ── Moliyaviy ko'rsatkichlar ── */}
        <SectionDivider title="Moliyaviy ko'rsatkichlar" />
        <div className="grid md:grid-cols-2 gap-5">
          <InfoRow
            label="Shartnoma summasi"
            value={formatSum(data.shartnoma_summasi)}
          />
          <InfoRow
            label="Sarflangan summa"
            value={formatSum(data.sarflangan_summa)}
          />
        </div>

        {Number(data.shartnoma_summasi) > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                Sarflangan ulushi
              </p>
              <span className="text-xs font-bold text-blue-500 tabular-nums">
                {spendPct}%
              </span>
            </div>
            <div className="h-2.5 bg-blue-50 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-400 transition-all duration-700"
                style={{ width: `${spendPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-300 mt-1">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        )}

        {/* ── Tavsif ── */}
        {data.tavsif && (
          <>
            <SectionDivider title="Tavsif" />
            <div className="flex gap-2 text-sm text-slate-600 leading-relaxed">
              <FileTextOutlined className="text-slate-300 text-xs mt-0.5 flex-shrink-0" />
              <p>{data.tavsif}</p>
            </div>
          </>
        )}

        {/* ── Hujjatlar ── */}
        <SectionDivider title="Hujjatlar" />
        {hujjatLoading ? (
          <div className="flex justify-center py-6">
            <Spin size="small" />
          </div>
        ) : hujjatlar.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-300 gap-2">
            <PaperClipOutlined className="text-2xl" />
            <p className="text-sm">Hujjatlar mavjud emas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {[
                    "Nomi",
                    "Kategoriya",
                    "Boshqarma",
                    "Yuklovchi",
                    "Muddat",
                    "Holat",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[11px] font-semibold uppercase tracking-[0.13em] text-slate-400 pb-3 pr-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hujjatlar.map((h, i) => {
                  const holatCfg =
                    HUJJAT_HOLAT_CONFIG[h.holat] ??
                    HUJJAT_HOLAT_CONFIG["kutilmoqda"];
                  return (
                    <tr
                      onClick={() => navigate(`/hujjatlar/${h.id}`)}
                      key={h.id}
                      className={`border-t border-slate-100 hover:bg-slate-50/70 p-1 cursor-pointer! transition-colors ${
                        i === 0 ? "border-t-0" : ""
                      }`}
                    >
                      {/* Nomi */}
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <FileTypeBadge type={h.fayl_turi} />
                          <span className="font-medium text-slate-700">
                            {h.nomi}
                          </span>
                        </div>
                      </td>

                      {/* Kategoriya */}
                      <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">
                        {h.kategoriya_nomi || "—"}
                      </td>

                      {/* Boshqarma */}
                      <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">
                        {h.boshqarma_nomi || "—"}
                      </td>

                      {/* Yuklovchi */}
                      <td className="py-3 pr-4 text-slate-500 whitespace-nowrap">
                        {h.yuklovchi_fio || "—"}
                      </td>

                      {/* Muddat */}
                      <td className="py-3 pr-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {h.is_kechikkan ? (
                            <WarningOutlined className="text-rose-400 text-xs" />
                          ) : (
                            <ClockCircleOutlined className="text-slate-300 text-xs" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              h.is_kechikkan
                                ? "text-rose-500"
                                : "text-slate-600"
                            }`}
                          >
                            {formatDate(h.muddat)}
                          </span>
                        </div>
                      </td>

                      {/* Holat */}
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${holatCfg.badge}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${holatCfg.dot}`}
                          />
                          {h.holat_display}
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
    </div>
  );
};

export default ObyektDetailPage;
