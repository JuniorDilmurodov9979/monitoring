import { useEffect, useState } from "react";
import { Row, Col, Spin, Alert } from "antd";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";

type DashboardStats = {
  jami_obyektlar: number;
  muammoli_obyektlar: number;
  tugatilgan_obyektlar: number;
  jami_hujjatlar: number;
  kutilmoqda_hujjatlar: number;
  kechikkan_hujjatlar: number;
  jami_topshiriqlar: number;
  bajarilgan_topshiriqlar: number;
  kechikkan_topshiriqlar: number;
  jami_jarimalar: number;
  bu_oy_jarimalar: number;
  eng_yomon_boshqarma: string;
  ai_xulosa: string;
};

const SECTIONS = [
  {
    key: "obyektlar",
    label: "Obyektlar",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
    cards: (s: DashboardStats) => [
      { title: "Jami obyektlar", value: s.jami_obyektlar, variant: "neutral" },
      {
        title: "Muammoli obyektlar",
        value: s.muammoli_obyektlar,
        variant: "danger",
      },
      {
        title: "Tugatilgan obyektlar",
        value: s.tugatilgan_obyektlar,
        variant: "success",
      },
    ],
  },
  {
    key: "hujjatlar",
    label: "Hujjatlar",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    cards: (s: DashboardStats) => [
      { title: "Jami hujjatlar", value: s.jami_hujjatlar, variant: "neutral" },
      {
        title: "Kutilmoqda",
        value: s.kutilmoqda_hujjatlar,
        variant: "warning",
      },
      {
        title: "Kechikkan hujjatlar",
        value: s.kechikkan_hujjatlar,
        variant: "danger",
      },
    ],
  },
  {
    key: "topshiriqlar",
    label: "Topshiriqlar",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    cards: (s: DashboardStats) => [
      {
        title: "Jami topshiriqlar",
        value: s.jami_topshiriqlar,
        variant: "neutral",
      },
      {
        title: "Bajarilgan",
        value: s.bajarilgan_topshiriqlar,
        variant: "success",
      },
      {
        title: "Kechikkan topshiriqlar",
        value: s.kechikkan_topshiriqlar,
        variant: "danger",
      },
    ],
  },
  {
    key: "jarimalar",
    label: "Jarimalar",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    cards: (s: DashboardStats) => [
      { title: "Jami jarimalar", value: s.jami_jarimalar, variant: "neutral" },
      {
        title: "Bu oy jarimalar (ball)",
        value: s.bu_oy_jarimalar,
        variant: "danger",
      },
      {
        title: "Eng yomon boshqarma",
        value: s.eng_yomon_boshqarma,
        variant: "warning",
      },
    ],
  },
];

const variantConfig: Record<
  string,
  {
    valueCls: string;
    badgeCls: string;
    badgeLabel: string;
    border: string;
    leftBar: string;
  }
> = {
  neutral: {
    valueCls: "text-slate-800",
    badgeCls: "bg-slate-100 text-slate-500",
    badgeLabel: "Jami",
    border: "border-slate-200",
    leftBar: "bg-slate-300",
  },
  danger: {
    valueCls: "text-rose-600",
    badgeCls: "bg-rose-50 text-rose-500",
    badgeLabel: "Xavfli",
    border: "border-slate-200",
    leftBar: "bg-rose-400",
  },
  success: {
    valueCls: "text-emerald-600",
    badgeCls: "bg-emerald-50 text-emerald-600",
    badgeLabel: "Yaxshi",
    border: "border-slate-200",
    leftBar: "bg-emerald-400",
  },
  warning: {
    valueCls: "text-amber-600",
    badgeCls: "bg-amber-50 text-amber-600",
    badgeLabel: "Ehtiyot",
    border: "border-slate-200",
    leftBar: "bg-amber-400",
  },
};

const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get(API_ENDPOINTS.DASHBOARD.STATS);
        setStats(res.data);
      } catch (error) {
        console.error("Statistika olishda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50">
        <Spin size="large" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <Alert message="Ma'lumot topilmadi" type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">
          Monitoring tizimi
        </p>
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
          Boshqaruv paneli
        </h1>
      </div>

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <div key={section.key}>
            {/* Section label */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-slate-400">{section.icon}</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {section.label}
              </span>
              <div className="flex-1 h-px bg-slate-200 ml-1" />
            </div>

            <Row gutter={[14, 14]}>
              {section.cards(stats).map((card) => (
                <Col xs={24} md={8} key={card.title}>
                  <StatCard
                    title={card.title}
                    value={card.value}
                    variant={card.variant}
                  />
                </Col>
              ))}
            </Row>
          </div>
        ))}

        {/* AI Xulosa */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-slate-400">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              AI Xulosa
            </span>
            <div className="flex-1 h-px bg-slate-200 ml-1" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex gap-3 items-start">
              <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-violet-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                {stats.ai_xulosa}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  variant = "neutral",
}: {
  title: string;
  value: number | string;
  variant?: string;
}) => {
  const cfg = variantConfig[variant] ?? variantConfig.neutral;

  return (
    <div
      className={`
        relative bg-white rounded-2xl border ${cfg.border}
        px-5 pt-5 pb-5 shadow-sm overflow-hidden
        hover:shadow-md transition-shadow duration-200
      `}
    >
      {/* Left accent bar */}
      <div
        className={`absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full ${cfg.leftBar}`}
      />

      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-slate-500 leading-snug max-w-[65%]">
          {title}
        </p>
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badgeCls}`}
        >
          {cfg.badgeLabel}
        </span>
      </div>

      <p className={`text-3xl font-bold tabular-nums ${cfg.valueCls}`}>
        {value}
      </p>
    </div>
  );
};

export default DashboardPage;
