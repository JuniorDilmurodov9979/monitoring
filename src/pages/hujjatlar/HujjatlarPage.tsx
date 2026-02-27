import { useEffect, useState } from "react";
import {
  Table,
  Pagination,
  Spin,
  Button,
  Form,
  message,
  Modal,
  Input,
  DatePicker,
  Upload,
  Tag,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { useNavigate } from "react-router-dom";
import {
  PlusOutlined,
  UploadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

interface Hujjat {
  id: number;
  nomi: string;
  kategoriya_nomi: string;
  boshqarma_nomi: string;
  obyekt_nomi: string;
  fayl_turi: string;
  holat: string;
  holat_display: string;
  muddat: string;
  yuklangan_vaqt: string;
  is_kechikkan: boolean;
}

const holatColor: Record<string, { bg: string; text: string; dot: string }> = {
  default: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
  kutilmoqda: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-400",
  },
  tasdiqlandi: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-400",
  },
  rad_etildi: { bg: "bg-rose-50", text: "text-rose-500", dot: "bg-rose-400" },
  arxiv: { bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400" },
};

const HolatBadge = ({ holat, label }: { holat: string; label: string }) => {
  const style = holatColor[holat] ?? holatColor.default;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
};

const HujjatlarPage = () => {
  const [data, setData] = useState<Hujjat[]>([]);
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const fetchHujjatlarData = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await api.get(
        `${API_ENDPOINTS.HUJJATLAR.LIST}?page=${pageNumber}`,
      );
      setData(response.data.results);
      setCount(response.data.count);
    } catch (error) {
      console.error("Error fetching hujjatlar data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHujjatlarData(page);
  }, [page]);

  const columns: ColumnsType<Hujjat> = [
    {
      title: "Nomi",
      dataIndex: "nomi",
      render: (_, record) => (
        <button
          onClick={() => navigate(`/hujjatlar/${record.id}`)}
          className="flex items-center gap-2 text-left group cursor-pointer!"
        >
          <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors cursor-pointer!">
            <FileTextOutlined className="text-slate-400 group-hover:text-blue-500 text-xs transition-colors" />
          </span>
          <span className="text-slate-700 cursor-pointer! font-medium group-hover:text-blue-600 transition-colors text-sm">
            {record.nomi}
          </span>
        </button>
      ),
    },
    {
      title: "Obyekt",
      dataIndex: "obyekt_nomi",
      render: (val) => <span className="text-slate-600 text-sm">{val}</span>,
    },
    {
      title: "Boshqarma",
      dataIndex: "boshqarma_nomi",
      render: (val) => <span className="text-slate-600 text-sm">{val}</span>,
    },
    {
      title: "Kategoriya",
      dataIndex: "kategoriya_nomi",
      render: (val) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
          {val}
        </span>
      ),
    },
    {
      title: "Holat",
      dataIndex: "holat_display",
      render: (val, record) => <HolatBadge holat={record.holat} label={val} />,
    },
  ];

  const handleCreateHujjat = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("obyekt", values.obyekt);
      formData.append("kategoriya", values.kategoriya);
      formData.append("nomi", values.nomi);
      formData.append("muddat", dayjs(values.muddat).format("YYYY-MM-DD"));
      formData.append("izoh", values.izoh || "");
      if (values.fayl?.fileList?.length > 0) {
        formData.append("fayl", values.fayl.fileList[0].originFileObj);
      }
      await api.post(API_ENDPOINTS.HUJJATLAR.LIST, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Hujjat muvaffaqiyatli qo'shildi");
      setIsModalOpen(false);
      form.resetFields();
      fetchHujjatlarData(page);
    } catch (error) {
      console.error("Create error:", error);
      message.error("Hujjat qo'shishda xatolik");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8 rounded-xl">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">
          Hujjatlar boshqaruvi
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Hujjatlar
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors duration-150"
          >
            <PlusOutlined className="text-xs" />
            Yangi Hujjat
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={data}
              rowKey="id"
              pagination={false}
              className="hujjatlar-table"
              rowClassName="hover:bg-slate-50 transition-colors"
            />
            <div className="flex justify-between items-center px-5 py-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Jami{" "}
                <span className="font-semibold text-slate-600">{count}</span> ta
                hujjat
              </span>
              <Pagination
                current={page}
                total={count}
                pageSize={20}
                onChange={(p) => setPage(p)}
                size="small"
              />
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <FileTextOutlined className="text-slate-500 text-sm" />
            </div>
            <span className="text-base font-semibold text-slate-800">
              Yangi Hujjat Qo'shish
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleCreateHujjat}
        okText="Saqlash"
        okButtonProps={{
          className: "!bg-slate-800 !border-slate-800 hover:!bg-slate-700",
        }}
        cancelText="Bekor qilish"
        className="hujjat-modal"
        width={520}
      >
        <Form layout="vertical" form={form} className="pt-2">
          <Form.Item
            name="nomi"
            label={
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Hujjat nomi
              </span>
            }
            rules={[{ required: true, message: "Nomi majburiy" }]}
          >
            <Input
              className="rounded-lg"
              placeholder="Hujjat nomini kiriting"
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="kategoriya"
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Kategoriya
                </span>
              }
              rules={[{ required: true }]}
            >
              <Input className="rounded-lg" placeholder="Kategoriya ID" />
            </Form.Item>

            <Form.Item
              name="obyekt"
              label={
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Obyekt
                </span>
              }
              rules={[{ required: true }]}
            >
              <Input className="rounded-lg" placeholder="Obyekt ID" />
            </Form.Item>
          </div>

          <Form.Item
            name="muddat"
            label={
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Muddat
              </span>
            }
            rules={[{ required: true }]}
          >
            <DatePicker
              className="w-full rounded-lg"
              placeholder="Sanani tanlang"
            />
          </Form.Item>

          <Form.Item
            name="izoh"
            label={
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Izoh
              </span>
            }
          >
            <Input.TextArea
              rows={3}
              className="rounded-lg"
              placeholder="Izoh (ixtiyoriy)"
            />
          </Form.Item>

          <Form.Item
            name="fayl"
            label={
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Fayl yuklash
              </span>
            }
            valuePropName="file"
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />} className="rounded-lg">
                Fayl tanlash
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Table style overrides */}
      <style>{`
        .hujjatlar-table .ant-table {
          background: transparent;
        }
        .hujjatlar-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 16px;
        }
        .hujjatlar-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9;
          padding: 13px 16px;
        }
        .hujjatlar-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none;
        }
        .hujjatlar-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
};

export default HujjatlarPage;
