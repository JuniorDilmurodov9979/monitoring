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
    console.log("SETTING DATA FOR PAGE:", page);
    try {
      setLoading(true);
      const res = await api.get(API_ENDPOINTS.TOPSHIRIQLAR.LIST, {
        params: { page },
      });
      setData(res.data.results);
      console.log("SETTING DATA FOR PAGE:", page);
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
      row.ijrochi_boshqarma_nomi
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
      width: 140,
      render: (val) => (
        <span className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {val}
        </span>
      ),
    },
    {
      title: "Boshqarma",
      dataIndex: "ijrochi_boshqarma_nomi",
      key: "ijrochi_boshqarma_nomi",
      width: 110,
      render: (val) => (
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
          {val}
        </span>
      ),
    },
    {
      title: "Band №",
      dataIndex: "band_raqami",
      key: "band_raqami",
      width: 80,
      align: "center",
      render: (val) => (
        <span className="text-slate-500 font-medium">#{val}</span>
      ),
    },
    {
      title: "Mazmun",
      dataIndex: "mazmun",
      key: "mazmun",
      render: (val) => (
        <span className="text-slate-700 text-sm leading-snug">{val}</span>
      ),
    },
    {
      title: "Muddat",
      dataIndex: "muddat",
      key: "muddat",
      width: 120,
      render: (val) => (
        <span className="text-slate-600 text-sm font-medium">{val}</span>
      ),
    },
    {
      title: "Holat",
      dataIndex: "holat",
      key: "holat",
      width: 130,
      render: (val, row) => {
        const cfg = statusConfig[val] || statusConfig.jarayonda;
        return (
          <Tag
            icon={cfg.icon}
            color={cfg.antColor}
            className="flex items-center gap-1 text-xs font-medium px-2 py-0.5"
          >
            {row.holat_display}
          </Tag>
        );
      },
    },
    {
      title: "Qolgan kunlar",
      dataIndex: "qolgan_kunlar",
      key: "qolgan_kunlar",
      width: 130,
      align: "center",
      render: (val, row) => {
        if (row.bajarildi)
          return (
            <Badge
              status="success"
              text={
                <span className="text-green-600 text-xs font-semibold">
                  Tugallandi
                </span>
              }
            />
          );
        if (val < 0)
          return (
            <Tooltip title={`${Math.abs(val)} kun kechikdi`}>
              <span className="text-red-600 font-bold text-sm bg-red-50 px-2 py-0.5 rounded">
                {val} kun
              </span>
            </Tooltip>
          );
        return (
          <span className="text-blue-600 font-semibold text-sm bg-blue-50 px-2 py-0.5 rounded">
            +{val} kun
          </span>
        );
      },
    },
  ];

  console.log(currentPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
              <FileTextOutlined className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">
                Topshiriqlar
              </h1>
              <p className="text-xs text-slate-500">
                Bayonnomalar bo'yicha topshiriqlar ro'yxati
              </p>
            </div>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => getAllTopshiriqlar(currentPage)}
            className="border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600"
          >
            Yangilash
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
        {/* ── Stat Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Jami",
              value: total,
              color: "text-slate-700",
              bg: "bg-white",
              border: "border-slate-200",
            },
            {
              label: "Kechikkan",
              value: stats.kechikkan,
              color: "text-red-600",
              bg: "bg-red-50",
              border: "border-red-200",
            },
            {
              label: "Jarayonda",
              value: stats.jarayonda,
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-200",
            },
            {
              label: "Bajarildi",
              value: stats.bajarildi,
              color: "text-green-600",
              bg: "bg-green-50",
              border: "border-green-200",
            },
          ].map((s) => (
            <Card
              key={s.label}
              size="small"
              className={`${s.bg} border ${s.border} rounded-xl shadow-none`}
              bodyStyle={{ padding: "16px 20px" }}
            >
              <Statistic
                title={
                  <span className="text-xs font-medium text-slate-500">
                    {s.label}
                  </span>
                }
                value={s.value}
                valueStyle={{ fontSize: 28, fontWeight: 700 }}
                className={s.color}
              />
            </Card>
          ))}
        </div>

        {/* ── Filters ───────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Search
            placeholder="Bayonnoma raqami, mazmun yoki boshqarma bo'yicha qidiring..."
            allowClear
            prefix={<SearchOutlined className="text-slate-400" />}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1"
            style={{ maxWidth: 510 }}
          />
          <Select
            value={filterHolat}
            onChange={setFilterHolat}
            style={{ minWidth: 160 }}
            suffixIcon={<FilterOutlined />}
          >
            <Option value="all">Barcha holatlar</Option>
            <Option value="kechikkan">Kechikkan</Option>
            <Option value="jarayonda">Jarayonda</Option>
            <Option value="bajarildi">Bajarildi</Option>
          </Select>
        </div>

        {/* ── Table ─────────────────────────────────────────────── */}
        <Card
          className="rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          bodyStyle={{ padding: 0 }}
        >
          <Spin spinning={loading} tip="Yuklanmoqda...">
            <Table
              dataSource={data}
              columns={columns}
              rowKey="id"
              size="middle"
              pagination={{
                current: currentPage,
                onChange: (page) => {
                  setCurrentPage(page);
                },
                pageSize: 10,
                total: total,
                showTotal: (total, range) =>
                  `${range[0]}–${range[1]} / ${total} ta topshiriq`,
                showSizeChanger: false,
                className: "px-4 py-2",
              }}
              rowClassName={(record) =>
                `transition-colors duration-150 hover:bg-indigo-50 cursor-pointer ${
                  record.is_kechikkan ? "bg-red-50/40" : ""
                }`
              }
              scroll={{ x: 860 }}
              onRow={(record) => ({
                onClick: () => navigate(`/topshiriqlar/${record.id}`),
              })}
              locale={{
                emptyText: (
                  <div className="py-16 text-center text-slate-400">
                    <FileTextOutlined className="text-4xl mb-3 opacity-30" />
                    <p className="text-sm">Topshiriqlar topilmadi</p>
                  </div>
                ),
              }}
            />
          </Spin>
        </Card>
      </div>
    </div>
  );
};

export default TopshiriqlarPage;
