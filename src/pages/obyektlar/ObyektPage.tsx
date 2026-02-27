import { useEffect, useState } from "react";
import {
  Spin,
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  message,
} from "antd";
import {
  PlusOutlined,
  BuildOutlined,
  EnvironmentOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { useNavigate } from "react-router-dom";

interface Obyekt {
  id: number;
  nomi: string;
  manzil: string;
  holat: string;
  holat_display: string;
  bajarilish_foizi: number;
  reja_foizi: number;
  tugash_sanasi: string;
  is_muammoli: boolean;
}

interface CreateObyektData {
  nomi: string;
  manzil: string;
  buyurtmachi: string;
  pudratchi: string;
  holat: string;
  reja_foizi: number;
  bajarilish_foizi: number;
  boshlanish_sanasi: string;
  tugash_sanasi: string;
  shartnoma_summasi: string;
  sarflangan_summa: string;
  masul_xodim: number;
  tavsif: string;
  rasm: string;
}

interface User {
  id: number;
  fio: string;
  username: string;
  first_name: string;
  last_name: string;
}

const holatConfig: Record<string, { bg: string; text: string; dot: string }> = {
  rejada: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  jarayonda: { bg: "bg-indigo-50", text: "text-indigo-600", dot: "bg-indigo-400" },
  tugatilgan: {
    bg: "bg-green-50",
    text: "text-green-600",
    dot: "bg-green-500",
  },
  toxtatilgan: { bg: "bg-amber-50", text: "text-amber-600", dot: "bg-amber-500" },
  muammoli: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
};

const HolatBadge = ({ holat, label }: { holat: string; label: string }) => {
  const cfg = holatConfig[holat] ?? holatConfig.rejada;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {label}
    </span>
  );
};

const MiniProgress = ({ value, color }: { value: number; color: string }) => (
  <div className="flex items-center gap-2 min-w-[100px]">
    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${value}%`, background: color }}
      />
    </div>
    <span className="text-xs font-medium text-slate-500 w-8 text-right tabular-nums">
      {value}%
    </span>
  </div>
);

const FormLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
    {children}
  </span>
);

const ObyektPage = () => {
  const [data, setData] = useState<Obyekt[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const getObyektlar = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.OBYEKTLAR.LIST);
      setData(response.data.results);
    } catch (error) {
      console.error("Error fetching obyektlar:", error);
      message.error("Obyektlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const getUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.get(API_ENDPOINTS.USERS.LIST);
      setUsers(response.data.results || response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    getObyektlar();
  }, []);
  useEffect(() => {
    if (isModalOpen) getUsers();
  }, [isModalOpen]);

  const handleCreateObyekt = async (values: any) => {
    try {
      setCreateLoading(true);
      const payload: CreateObyektData = {
        ...values,
        boshlanish_sanasi: values.boshlanish_sanasi.format("YYYY-MM-DD"),
        tugash_sanasi: values.tugash_sanasi.format("YYYY-MM-DD"),
        shartnoma_summasi: values.shartnoma_summasi.toString(),
        sarflangan_summa: values.sarflangan_summa.toString(),
      };
      await api.post(API_ENDPOINTS.OBYEKTLAR.LIST, payload);
      message.success("Obyekt muvaffaqiyatli qo'shildi");
      setIsModalOpen(false);
      form.resetFields();
      getObyektlar();
    } catch (error) {
      console.error("Error creating obyekt:", error);
      message.error("Obyekt qo'shishda xatolik yuz berdi");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-8">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-1">
          Qurilish boshqaruvi
        </p>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Obyektlar
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors duration-150"
          >
            <PlusOutlined className="text-xs" />
            Yangi Obyekt
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
            {/* Custom table */}
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    "Nomi",
                    "Manzil",
                    "Holati",
                    "Bajarilish",
                    "Reja",
                    "Tugash",
                    "Muammo",
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
                {data.map((row, i) => (
                  <tr
                    key={row.id}
                    onClick={() => navigate(`/obyekt/${row.id}`)}
                    className={`
                      cursor-pointer border-b border-slate-100 last:border-b-0
                      hover:bg-slate-50 transition-colors duration-100
                      ${i % 2 === 0 ? "" : ""}
                    `}
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <BuildOutlined className="text-slate-400 text-xs" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700">
                          {row.nomi}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 text-slate-500 text-sm">
                        <EnvironmentOutlined className="text-slate-300 text-xs" />
                        {row.manzil}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <HolatBadge holat={row.holat} label={row.holat_display} />
                    </td>
                    <td className="px-4 py-3.5">
                      <MiniProgress
                        value={row.bajarilish_foizi}
                        color="#3b82f6"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <MiniProgress value={row.reja_foizi} color="#a855f7" />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-slate-600 tabular-nums">
                        {dayjs(row.tugash_sanasi).format("DD.MM.YY")}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {row.is_muammoli ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-500">
                          <WarningOutlined className="text-[10px]" /> Bor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{" "}
                          Yo'q
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.length === 0 && (
              <div className="text-center py-16 text-slate-400 text-sm">
                Hozircha obyektlar mavjud emas
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <BuildOutlined className="text-slate-500 text-sm" />
            </div>
            <span className="text-base font-semibold text-slate-800">
              Yangi Obyekt Qo'shish
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        confirmLoading={createLoading}
        okText="Qo'shish"
        cancelText="Bekor qilish"
        okButtonProps={{
          className: "!bg-slate-800 !border-slate-800 hover:!bg-slate-700",
        }}
        width={720}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateObyekt}
          initialValues={{
            holat: "rejada",
            reja_foizi: 0,
            bajarilish_foizi: 0,
          }}
          className="pt-2"
        >
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              className="col-span-2"
              label={<FormLabel>Nomi</FormLabel>}
              name="nomi"
              rules={[{ required: true, message: "Obyekt nomini kiriting" }]}
            >
              <Input className="rounded-lg" placeholder="Obyekt nomi" />
            </Form.Item>

            <Form.Item
              className="col-span-2"
              label={<FormLabel>Manzil</FormLabel>}
              name="manzil"
              rules={[{ required: true, message: "Manzilni kiriting" }]}
            >
              <Input className="rounded-lg" placeholder="Manzil" />
            </Form.Item>

            <Form.Item
              label={<FormLabel>Buyurtmachi</FormLabel>}
              name="buyurtmachi"
              rules={[{ required: true, message: "Buyurtmachini kiriting" }]}
            >
              <Input className="rounded-lg" placeholder="Buyurtmachi" />
            </Form.Item>

            <Form.Item
              label={<FormLabel>Pudratchi</FormLabel>}
              name="pudratchi"
              rules={[{ required: true, message: "Pudratchi kiriting" }]}
            >
              <Input className="rounded-lg" placeholder="Pudratchi" />
            </Form.Item>

            <Form.Item
              label={<FormLabel>Holati</FormLabel>}
              name="holat"
              rules={[{ required: true, message: "Holatni tanlang" }]}
            >
              <Select className="rounded-lg" placeholder="Holatni tanlang">
                <Select.Option value="rejada">Rejada</Select.Option>
                <Select.Option value="jarayonda">Jarayonda</Select.Option>
                <Select.Option value="tugatilgan">Tugatilgan</Select.Option>
                <Select.Option value="to'xtatilgan">To'xtatilgan</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label={<FormLabel>Mas'ul xodim</FormLabel>}
              name="masul_xodim"
              rules={[{ required: true, message: "Mas'ul xodimni tanlang" }]}
            >
              <Select
                className="rounded-lg"
                placeholder="Xodimni tanlang"
                loading={usersLoading}
                showSearch
                optionFilterProp="label"
                options={users.map((u) => ({ value: u.id, label: u.fio }))}
              />
            </Form.Item>

            <Form.Item
              label={<FormLabel>Reja foizi</FormLabel>}
              name="reja_foizi"
            >
              <InputNumber
                min={0}
                max={100}
                className="w-full rounded-lg"
                placeholder="0"
                addonAfter="%"
              />
            </Form.Item>

            <Form.Item
              label={<FormLabel>Bajarilish foizi</FormLabel>}
              name="bajarilish_foizi"
            >
              <InputNumber
                min={0}
                max={100}
                className="w-full rounded-lg"
                placeholder="0"
                addonAfter="%"
              />
            </Form.Item>

            <Form.Item
              label={<FormLabel>Boshlanish sanasi</FormLabel>}
              name="boshlanish_sanasi"
              rules={[{ required: true, message: "Sanani tanlang" }]}
            >
              <DatePicker className="w-full rounded-lg" format="DD.MM.YYYY" />
            </Form.Item>

            <Form.Item
              label={<FormLabel>Tugash sanasi</FormLabel>}
              name="tugash_sanasi"
              rules={[{ required: true, message: "Sanani tanlang" }]}
            >
              <DatePicker className="w-full rounded-lg" format="DD.MM.YYYY" />
            </Form.Item>

            <Form.Item
              label={<FormLabel>Shartnoma summasi</FormLabel>}
              name="shartnoma_summasi"
              rules={[{ required: true, message: "Summani kiriting" }]}
            >
              <InputNumber
                className="w-full rounded-lg"
                placeholder="0"
                addonAfter="so'm"
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
              />
            </Form.Item>

            <Form.Item
              label={<FormLabel>Sarflangan summa</FormLabel>}
              name="sarflangan_summa"
              rules={[{ required: true, message: "Summani kiriting" }]}
            >
              <InputNumber
                className="w-full rounded-lg"
                placeholder="0"
                addonAfter="so'm"
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
              />
            </Form.Item>

            <Form.Item
              className="col-span-2"
              label={<FormLabel>Tavsif</FormLabel>}
              name="tavsif"
            >
              <Input.TextArea
                rows={3}
                className="rounded-lg"
                placeholder="Obyekt haqida qo'shimcha ma'lumot"
              />
            </Form.Item>

            <Form.Item
              className="col-span-2"
              label={<FormLabel>Rasm URL</FormLabel>}
              name="rasm"
            >
              <Input className="rounded-lg" placeholder="https://..." />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ObyektPage;
