import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Tag,
  Badge,
  Button,
  Input,
  Select,
  Tooltip,
  Card,
  Statistic,
  Spin,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";

const { Search } = Input;
const { Option } = Select;

// ─── Status helpers ───────────────────────────────────────────────────────────
const statusConfig = {
  kechikkan: {
    icon: <ExclamationCircleOutlined />,
    antColor: "red",
  },
  jarayonda: {
    icon: <ClockCircleOutlined />,
    antColor: "blue",
  },
  bajarildi: {
    icon: <CheckCircleOutlined />,
    antColor: "green",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
const TopshiriqlarPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterHolat, setFilterHolat] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const getAllTopshiriqlar = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.TOPSHIRIQLAR.LIST, {
        params: { page },
      });
      setData(res.data.results);
      setTotal(res.data.count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllTopshiriqlar(currentPage);
  }, [currentPage]);

  const filtered = data.filter((row) => {
    const matchSearch =
      row.bayonnoma_raqami.toLowerCase().includes(searchText.toLowerCase()) ||
      row.mazmun.toLowerCase().includes(searchText.toLowerCase()) ||
      row.ijrochi_boshqarma_qisqa_nomi
        .toLowerCase()
        .includes(searchText.toLowerCase());
    const matchHolat = filterHolat === "all" || row.holat === filterHolat;
    return matchSearch && matchHolat;
  });

  const stats = {
    kechikkan: data.filter((d) => d.holat === "kechikkan").length,
    jarayonda: data.filter((d) => d.holat === "jarayonda").length,
    bajarildi: data.filter((d) => d.holat === "bajarildi").length,
  };

  const columns = [
    {
      title: "Bayonnoma №",
      dataIndex: "bayonnoma_raqami",
      key: "bayonnoma_raqami",
      width: 150,
      render: (val) => (
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 12,
            fontWeight: 600,
            color: "#1e293b",
            background: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
            padding: "3px 10px",
            borderRadius: 6,
            border: "1px solid #cbd5e1",
            letterSpacing: "0.03em",
          }}
        >
          {val}
        </span>
      ),
    },
    {
      title: "Boshqarma",
      dataIndex: "ijrochi_boshqarma_qisqa_nomi",
      key: "ijrochi_boshqarma_qisqa_nomi",
      width: 120,
      render: (val) => (
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
            letterSpacing: "0.02em",
          }}
        >
          {val}
        </div>
      ),
    },
    {
      title: "Band №",
      dataIndex: "band_raqami",
      key: "band_raqami",
      width: 90,
      align: "center",
      render: (val) => (
        <span
          style={{
            color: "#94a3b8",
            fontWeight: 600,
            fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          #{val}
        </span>
      ),
    },
    {
      title: "Mazmun",
      dataIndex: "mazmun",
      key: "mazmun",
      render: (val) => (
        <span
          style={{
            color: "#334155",
            fontSize: 13.5,
            lineHeight: 1.55,
            fontWeight: 400,
          }}
        >
          {val}
        </span>
      ),
    },
    {
      title: "Muddat",
      dataIndex: "muddat",
      key: "muddat",
      width: 140,
      render: (val) => (
        <span
          style={{
            color: "#475569",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <ClockCircleOutlined style={{ color: "#94a3b8", fontSize: 12 }} />
          {val}
        </span>
      ),
    },
    {
      title: "Holat",
      dataIndex: "holat",
      key: "holat",
      width: 140,
      render: (val, row) => {
        const cfg = statusConfig[val] || statusConfig.jarayonda;
        const styleMap = {
          kechikkan: {
            bg: "linear-gradient(135deg,#fff1f2,#ffe4e6)",
            color: "#be123c",
            border: "#fecdd3",
          },
          jarayonda: {
            bg: "linear-gradient(135deg,#eff6ff,#dbeafe)",
            color: "#1d4ed8",
            border: "#bfdbfe",
          },
          bajarildi: {
            bg: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
            color: "#15803d",
            border: "#bbf7d0",
          },
        };
        const s = styleMap[val] || styleMap.jarayonda;
        return (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              background: s.bg,
              color: s.color,
              border: `1px solid ${s.border}`,
              borderRadius: 20,
              padding: "3px 11px",
              fontSize: 12,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {cfg.icon}
            {row.holat_display}
          </span>
        );
      },
    },
    {
      title: "Qolgan kunlar",
      dataIndex: "qolgan_kunlar",
      key: "qolgan_kunlar",
      width: 140,
      align: "center",
      render: (val, row) => {
        if (row.bajarildi)
          return (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                color: "#16a34a",
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              <CheckCircleOutlined />
              Tugallandi
            </span>
          );
        if (val < 0)
          return (
            <Tooltip title={`${Math.abs(val)} kun kechikdi`}>
              <span
                style={{
                  display: "inline-block",
                  color: "#dc2626",
                  fontWeight: 700,
                  fontSize: 13,
                  background: "linear-gradient(135deg,#fff1f2,#ffe4e6)",
                  border: "1px solid #fecdd3",
                  padding: "2px 10px",
                  borderRadius: 8,
                  cursor: "help",
                }}
              >
                {val} kun
              </span>
            </Tooltip>
          );
        return (
          <span
            style={{
              display: "inline-block",
              color: "#2563eb",
              fontWeight: 700,
              fontSize: 13,
              background: "linear-gradient(135deg,#eff6ff,#dbeafe)",
              border: "1px solid #bfdbfe",
              padding: "2px 10px",
              borderRadius: 8,
            }}
          >
            +{val} kun
          </span>
        );
      },
    },
  ];

  const statCards = [
    {
      label: "Jami",
      value: total,
      color: "#1e293b",
      bg: "linear-gradient(135deg,#f8fafc,#f1f5f9)",
      border: "#e2e8f0",
      accent: "#64748b",
      dot: "#94a3b8",
    },
    {
      label: "Kechikkan",
      value: stats.kechikkan,
      color: "#be123c",
      bg: "linear-gradient(135deg,#fff1f2,#ffe4e6)",
      border: "#fecdd3",
      accent: "#e11d48",
      dot: "#fb7185",
    },
    {
      label: "Jarayonda",
      value: stats.jarayonda,
      color: "#1d4ed8",
      bg: "linear-gradient(135deg,#eff6ff,#dbeafe)",
      border: "#bfdbfe",
      accent: "#2563eb",
      dot: "#60a5fa",
    },
    {
      label: "Bajarildi",
      value: stats.bajarildi,
      color: "#15803d",
      bg: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
      border: "#bbf7d0",
      accent: "#16a34a",
      dot: "#4ade80",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(160deg, #f8fafc 0%, #eef2ff 50%, #f0f9ff 100%)",
        borderRadius: 16,
        fontFamily: "'DM Sans', 'Nunito', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(226,232,240,0.8)",
          borderRadius: "16px 16px 0 0",
          boxShadow: "0 1px 12px rgba(99,102,241,0.07)",
        }}
      >
        <div
          style={{
            maxWidth: "100%",
            margin: "0 auto",
            padding: "18px 28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
              }}
            >
              <FileTextOutlined style={{ color: "#fff", fontSize: 20 }} />
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 800,
                  color: "#0f172a",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                Topshiriqlar
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: "#94a3b8",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                }}
              >
                Bayonnomalar bo'yicha topshiriqlar ro'yxati
              </p>
            </div>
          </div>

          {/* <Button
            icon={<ReloadOutlined />}
            onClick={() => getAllTopshiriqlar(currentPage)}
            style={{
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              color: "#64748b",
              fontWeight: 600,
              fontSize: 13,
              height: 38,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "#fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            Yangilash
          </Button> */}
        </div>
      </div>

      <div
        style={{
          maxWidth: "100%",
          margin: "0 auto",
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* ── Stat Cards ────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
          }}
        >
          {statCards.map((s) => (
            <div
              key={s.label}
              style={{
                background: s.bg,
                border: `1px solid ${s.border}`,
                borderRadius: 14,
                padding: "16px 20px",
                boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative circle */}
              <div
                style={{
                  position: "absolute",
                  top: -14,
                  right: -14,
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: s.dot,
                  opacity: 0.15,
                }}
              />
              <p
                style={{
                  margin: "0 0 4px",
                  fontSize: 11,
                  fontWeight: 700,
                  color: s.accent,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {s.label}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 32,
                  fontWeight: 800,
                  color: s.color,
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Filters ───────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Search
            placeholder="Bayonnoma raqami, mazmun yoki boshqarma..."
            allowClear
            prefix={<SearchOutlined style={{ color: "#94a3b8" }} />}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              flex: 1,
              maxWidth: 480,
              borderRadius: 10,
            }}
            styles={{
              input: {
                fontWeight: 500,
                fontSize: 13,
              },
            }}
          />
          <Select
            value={filterHolat}
            onChange={setFilterHolat}
            style={{ minWidth: 170 }}
            suffixIcon={<FilterOutlined style={{ color: "#64748b" }} />}
            styles={{
              popup: { borderRadius: 12 },
            }}
          >
            <Option value="all">Barcha holatlar</Option>
            <Option value="kechikkan">Kechikkan</Option>
            <Option value="jarayonda">Jarayonda</Option>
            <Option value="bajarildi">Bajarildi</Option>
          </Select>
        </div>

        {/* ── Table ─────────────────────────────────────────────── */}
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            borderRadius: 16,
            border: "1px solid #e2e8f0",
            boxShadow: "0 2px 16px rgba(99,102,241,0.07)",
            overflow: "hidden",
          }}
        >
          <style>{`
            .tsh-table .ant-table-thead > tr > th {
              background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%) !important;
              color: #64748b !important;
              font-size: 11px !important;
              font-weight: 700 !important;
              text-transform: uppercase !important;
              letter-spacing: 0.07em !important;
              border-bottom: 1px solid #e2e8f0 !important;
              padding: 13px 16px !important;
            }
            .tsh-table .ant-table-tbody > tr > td {
              padding: 13px 16px !important;
              border-bottom: 1px solid #f1f5f9 !important;
              transition: background 0.15s ease !important;
            }
            .tsh-table .ant-table-tbody > tr:hover > td {
              background: #f5f3ff !important;
            }
            .tsh-table .ant-table-tbody > tr:last-child > td {
              border-bottom: none !important;
            }
            .tsh-table .ant-pagination {
              padding: 14px 20px !important;
              margin: 0 !important;
              background: #fafafa;
              border-top: 1px solid #f1f5f9;
            }
            .tsh-table .ant-pagination-item-active {
              background: linear-gradient(135deg, #4f46e5, #6366f1) !important;
              border-color: transparent !important;
              border-radius: 8px !important;
            }
            .tsh-table .ant-pagination-item-active a {
              color: #fff !important;
              font-weight: 700 !important;
            }
            .tsh-table .ant-pagination-item {
              border-radius: 8px !important;
              font-weight: 600 !important;
            }
            .tsh-table .ant-table-row-kechikkan {
              background: rgba(254,242,242,0.5) !important;
            }
          `}</style>
          <Spin spinning={loading} tip="Yuklanmoqda...">
            <Table
              className="tsh-table"
              dataSource={data}
              columns={columns}
              rowKey="id"
              size="middle"
              pagination={{
                current: currentPage,
                onChange: (page) => setCurrentPage(page),
                pageSize: 10,
                total: total,
                showTotal: (total, range) => (
                  <span
                    style={{ color: "#94a3b8", fontSize: 12, fontWeight: 500 }}
                  >
                    {range[0]}–{range[1]} /{" "}
                    <strong style={{ color: "#475569" }}>{total}</strong> ta
                    topshiriq
                  </span>
                ),
                showSizeChanger: false,
              }}
              rowClassName={(record) =>
                record.is_kechikkan ? "ant-table-row-kechikkan" : ""
              }
              scroll={{ x: 860 }}
              onRow={(record) => ({
                onClick: () => navigate(`/topshiriqlar/${record.id}`),
                style: { cursor: "pointer" },
              })}
              locale={{
                emptyText: (
                  <div
                    style={{
                      padding: "64px 0",
                      textAlign: "center",
                      color: "#cbd5e1",
                    }}
                  >
                    <FileTextOutlined
                      style={{ fontSize: 40, marginBottom: 12, opacity: 0.35 }}
                    />
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#94a3b8",
                      }}
                    >
                      Topshiriqlar topilmadi
                    </p>
                  </div>
                ),
              }}
            />
          </Spin>
        </div>
      </div>
    </div>
  );
};

export default TopshiriqlarPage;
