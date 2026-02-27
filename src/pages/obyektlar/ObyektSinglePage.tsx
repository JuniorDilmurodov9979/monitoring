import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Spin } from "antd";
import dayjs from "dayjs";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import {
  ArrowLeftOutlined,
  BuildOutlined,
  EnvironmentOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
} from "@ant-design/icons";

interface Obyekt {
  id: number;
  nomi: string;
  manzil: string;
  buyurtmachi: string;
  pudratchi: string;
  holat: string;
  holat_display: string;
  reja_foizi: number;
  bajarilish_foizi: number;
  boshlanish_sanasi: string;
  tugash_sanasi: string;
  shartnoma_summasi: string;
  sarflangan_summa: string;
  masul_xodim: number;
  masul_xodim_fio: string;
  tavsif: string;
  hujjatlar_soni: number;
  is_muammoli: boolean;
  rasm: string | null;
  created_at: string;
  updated_at: string;
}

const holatConfig: Record<string, { bg: string; text: string; dot: string }> = {
  rejada:         { bg: "bg-slate-100",  text: "text-slate-500",   dot: "bg-slate-400"   },
  jarayonda:      { bg: "bg-blue-50",    text: "text-blue-600",    dot: "bg-blue-400"    },
  tugatilgan:     { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  "to'xtatilgan": { bg: "bg-rose-50",    text: "text-rose-500",    dot: "bg-rose-400"    },
};

const HolatBadge = ({ holat, label }: { holat: string; label: string }) => {
  const cfg = holatConfig[holat] ?? holatConfig.rejada;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label}
    </span>
  );
};

const SectionDivider = ({ title }: { title?: string }) => (
  <div className="flex items-center gap-3 my-6">
    {title && (
      <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400 whitespace-nowrap">
        {title}
      </span>
    )}
    <div className="flex-1 h-px bg-slate-100" />
  </div>
);

const DetailRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">{label}</p>
    <div className="text-sm font-medium text-slate-700">{children}</div>
  </div>
);

const ProgressBar = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</span>
      <span className="text-sm font-bold tabular-nums" style={{ color }}>{value}%</span>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
  </div>
);

const ObyektSinglePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState<Obyekt | null>(null);
  const [loading, setLoading] = useState(false);

  const getSingleObyekt = async () => {
    try {
      setLoading(true);
      const response = await api.get(`${API_ENDPOINTS.OBYEKTLAR.LIST}${id}`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching obyekt:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getSingleObyekt(); }, [id]);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  const formatMoney = (value: string) => Number(value).toLocaleString("uz-UZ");

  const spendPercent = Math.min(
    Math.round((Number(data.sarflangan_summa) / Number(data.shartnoma_summasi)) * 100),
    100
  );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Back + breadcrumb */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors mb-3"
        >
          <ArrowLeftOutlined className="text-[10px]" />
          Obyektlar
        </button>

        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">
              Obyekt #{data.id}
            </p>
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">{data.nomi}</h1>
            <div className="flex items-center gap-1.5 mt-1.5 text-slate-400 text-sm">
              <EnvironmentOutlined className="text-xs" />
              {data.manzil}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <HolatBadge holat={data.holat} label={data.holat_display} />
            {data.is_muammoli && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-500">
                <WarningOutlined className="text-[10px]" />
                Muammoli
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-0">

        {/* Image */}
        {data.rasm && (
          <>
            <div className="rounded-xl overflow-hidden border border-slate-100 mb-2">
              <img
                src={data.rasm}
                alt={data.nomi}
                className="w-full max-h-72 object-cover"
              />
            </div>
            <SectionDivider />
          </>
        )}

        {/* Progress bars */}
        <SectionDivider title="Bajarilish holati" />
        <div className="grid md:grid-cols-2 gap-6">
          <ProgressBar label="Bajarilish" value={data.bajarilish_foizi} color="#3b82f6" />
          <ProgressBar label="Reja" value={data.reja_foizi} color="#a855f7" />
        </div>

        {/* Details */}
        <SectionDivider title="Asosiy ma'lumotlar" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
          <DetailRow label="Buyurtmachi">{data.buyurtmachi}</DetailRow>
          <DetailRow label="Pudratchi">{data.pudratchi}</DetailRow>
          <DetailRow label="Mas'ul xodim">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                <UserOutlined className="text-slate-400 text-[9px]" />
              </div>
              {data.masul_xodim_fio}
            </div>
          </DetailRow>
          <DetailRow label="Boshlanish sanasi">
            {dayjs(data.boshlanish_sanasi).format("DD MMM YYYY")}
          </DetailRow>
          <DetailRow label="Tugash sanasi">
            {dayjs(data.tugash_sanasi).format("DD MMM YYYY")}
          </DetailRow>
          <DetailRow label="Hujjatlar">
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                <FileTextOutlined className="text-[10px]" />
                {data.hujjatlar_soni} ta
              </span>
            </div>
          </DetailRow>
        </div>

        {/* Financials */}
        <SectionDivider title="Moliyaviy ko'rsatkichlar" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">
              Shartnoma summasi
            </p>
            <p className="text-xl font-bold text-slate-800 tabular-nums">
              {formatMoney(data.shartnoma_summasi)}
              <span className="text-sm font-medium text-slate-400 ml-1">so'm</span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400 mb-1">
              Sarflangan summa
            </p>
            <p className="text-xl font-bold text-slate-800 tabular-nums">
              {formatMoney(data.sarflangan_summa)}
              <span className="text-sm font-medium text-slate-400 ml-1">so'm</span>
            </p>
            <div className="mt-2">
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-400 transition-all duration-500"
                  style={{ width: `${spendPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 tabular-nums">{spendPercent}% sarflandi (Jami summadan)</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {data.tavsif && (
          <>
            <SectionDivider title="Tavsif" />
            <p className="text-sm text-slate-600 leading-relaxed">{data.tavsif}</p>
          </>
        )}

        {/* Footer */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-400">
          <ClockCircleOutlined className="text-[11px]" />
          Yaratilgan: {dayjs(data.created_at).format("DD MMM YYYY, HH:mm")}
        </div>
      </div>
    </div>
  );
};

export default ObyektSinglePage;