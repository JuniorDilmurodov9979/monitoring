import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import { useEffect, useState } from "react";
import {
  Table,
  Tag,
  Progress,
  Typography,
  Spin,
  Badge,
  Tooltip,
  Modal,
  Form,
  Input,
  DatePicker,
  Button,
  Popconfirm,
  message,
  Space,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  FileTextOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  AuditOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/shared/components/const/CustomUI";

const { Title, Text } = Typography;
const { TextArea } = Input;

// ─── Types ────────────────────────────────────────────────────────────────────

interface Bayonnoma {
  id: number;
  raqami: string;
  sana: string;
  mavzu: string;
  yaratuvchi_fio: string;
  topshiriqlar_soni: number;
  bajarilish_foizi: number;
}

interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Bayonnoma[];
}

interface PostPayload {
  raqami: string;
  sana: string;
  mavzu: string;
  fayl: string;
  ishtirokchilar: string;
  izoh: string;
  topshiriqlar: Record<string, string>[];
}

interface PutPayload {
  raqami: string;
  sana: string;
  mavzu: string;
  fayl: string;
  ishtirokchilar: string;
  izoh: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getProgressStatus(
  val: number,
): "success" | "active" | "exception" | "normal" {
  if (val === 100) return "success";
  if (val === 0) return "exception";
  if (val >= 60) return "active";
  return "normal";
}

function getProgressColor(val: number): string {
  if (val === 100) return "#52c41a";
  if (val >= 60) return "#1677ff";
  if (val >= 30) return "#faad14";
  return "#ff4d4f";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
    {children}
  </span>
);

const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) => (
  <div
    className="flex w-full items-center gap-4 rounded-2xl bg-white px-6 py-5 shadow-sm border border-slate-100"
    style={{ minWidth: 180 }}
  >
    <div
      className="flex h-12 w-12 items-center justify-center rounded-xl text-xl text-white shrink-0"
      style={{ background: color }}
    >
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-0.5">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
    </div>
  </div>
);

// Shared base fields used in both Create (POST) and Edit (PUT) modals
const BaseFormFields = () => (
  <>
    <div className="grid grid-cols-2 gap-4">
      <Form.Item
        name="raqami"
        label={<FieldLabel>Raqami</FieldLabel>}
        rules={[{ required: true, message: "Raqamni kiriting" }]}
      >
        <Input
          placeholder="2026-001"
          className="rounded-lg! font-mono!"
          prefix={<span className="text-slate-300">#</span>}
        />
      </Form.Item>

      <Form.Item
        name="sana"
        label={<FieldLabel>Sana</FieldLabel>}
        rules={[{ required: true, message: "Sanani tanlang" }]}
      >
        <DatePicker
          className="w-full! rounded-lg!"
          format="YYYY-MM-DD"
          placeholder="Sanani tanlang"
        />
      </Form.Item>
    </div>

    <Form.Item
      name="mavzu"
      label={<FieldLabel>Mavzu</FieldLabel>}
      rules={[{ required: true, message: "Mavzuni kiriting" }]}
    >
      <Input
        placeholder="Yig'ilish mavzusini kiriting"
        className="rounded-lg!"
      />
    </Form.Item>

    <Form.Item name="fayl" label={<FieldLabel>Fayl (URL)</FieldLabel>}>
      <Input
        placeholder="https://..."
        className="rounded-lg!"
        prefix={<FileTextOutlined className="text-slate-300" />}
      />
    </Form.Item>

    <Form.Item
      name="ishtirokchilar"
      label={<FieldLabel>Ishtirokchilar</FieldLabel>}
    >
      <TextArea
        rows={2}
        placeholder="Ishtirokchilar ro'yxatini kiriting..."
        className="rounded-lg!"
      />
    </Form.Item>

    <Form.Item name="izoh" label={<FieldLabel>Izoh</FieldLabel>}>
      <TextArea
        rows={2}
        placeholder="Qo'shimcha izoh..."
        className="rounded-lg!"
      />
    </Form.Item>
  </>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const BayonnomalarPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Bayonnoma[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Bayonnoma | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  // ── GET ────────────────────────────────────────────────────────────────────
  const getBayonnomalar = async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse>(API_ENDPOINTS.BAYONNOMALAR.LIST);
      setData(res.data.results);
      setTotal(res.data.count);
    } catch {
      messageApi.error("Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBayonnomalar();
  }, []);

  // ── POST ───────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      setSubmitting(true);

      // Transform Form.List nested key-value pairs → array of plain objects
      const topshiriqlar: Record<string, string>[] = (
        values.topshiriqlar ?? []
      ).map((item: { props?: { key: string; value: string }[] }) => {
        const obj: Record<string, string> = {};
        (item.props ?? []).forEach(({ key, value }) => {
          if (key) obj[key] = value ?? "";
        });
        return obj;
      });

      const payload: PostPayload = {
        raqami: values.raqami,
        sana: dayjs(values.sana).format("YYYY-MM-DD"),
        mavzu: values.mavzu,
        fayl: values.fayl ?? "",
        ishtirokchilar: values.ishtirokchilar ?? "",
        izoh: values.izoh ?? "",
        topshiriqlar,
      };

      await api.post(API_ENDPOINTS.BAYONNOMALAR.LIST, payload);
      messageApi.success("Bayonnoma muvaffaqiyatli qo'shildi!");
      createForm.resetFields();
      setCreateOpen(false);
      getBayonnomalar();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errorFields" in err) return;
      messageApi.error("Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── PUT ────────────────────────────────────────────────────────────────────
  const openEdit = (record: Bayonnoma) => {
    setEditTarget(record);
    editForm.setFieldsValue({
      raqami: record.raqami,
      sana: dayjs(record.sana),
      mavzu: record.mavzu,
      fayl: "",
      ishtirokchilar: "",
      izoh: "",
    });
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    try {
      const values = await editForm.validateFields();
      setSubmitting(true);

      const payload: PutPayload = {
        raqami: values.raqami,
        sana: dayjs(values.sana).format("YYYY-MM-DD"),
        mavzu: values.mavzu,
        fayl: values.fayl ?? "",
        ishtirokchilar: values.ishtirokchilar ?? "",
        izoh: values.izoh ?? "",
      };

      await api.put(
        `${API_ENDPOINTS.BAYONNOMALAR.LIST}${editTarget.id}/`,
        payload,
      );
      messageApi.success("Bayonnoma muvaffaqiyatli yangilandi!");
      editForm.resetFields();
      setEditOpen(false);
      setEditTarget(null);
      getBayonnomalar();
    } catch (err: unknown) {
      if (err && typeof err === "object" && "errorFields" in err) return;
      messageApi.error("Xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── DELETE ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      await api.delete(`${API_ENDPOINTS.BAYONNOMALAR.LIST}${id}/`);
      messageApi.success("Bayonnoma o'chirildi.");
      getBayonnomalar();
    } catch {
      messageApi.error("O'chirishda xatolik yuz berdi.");
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const avgCompletion =
    data.length > 0
      ? Math.round(
          data.reduce((s, d) => s + d.bajarilish_foizi, 0) / data.length,
        )
      : 0;
  const completed = data.filter((d) => d.bajarilish_foizi === 100).length;
  const totalTasks = data.reduce((s, d) => s + d.topshiriqlar_soni, 0);

  // ── Table columns ──────────────────────────────────────────────────────────
  const columns: ColumnsType<Bayonnoma> = [
    {
      title: <FieldLabel>Raqami</FieldLabel>,
      dataIndex: "raqami",
      key: "raqami",
      width: 130,
      render: (val: string) => (
        <Tag
          color="blue"
          className="rounded-full! px-3! py-0.5! text-xs! font-bold! font-mono! tracking-wider"
        >
          {val}
        </Tag>
      ),
    },
    {
      title: <FieldLabel>Sana</FieldLabel>,
      dataIndex: "sana",
      key: "sana",
      width: 170,
      render: (val: string) => (
        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
          <CalendarOutlined className="text-blue-400" />
          {formatDate(val)}
        </div>
      ),
    },
    {
      title: <FieldLabel>Mavzu</FieldLabel>,
      dataIndex: "mavzu",
      key: "mavzu",
      render: (val: string) => (
        <Tooltip title={val}>
          <div className="flex items-start gap-2 max-w-xs">
            <FileTextOutlined className="mt-0.5 shrink-0 text-indigo-400" />
            <Text
              ellipsis
              className="text-slate-800! text-sm! font-medium w-[256px]"
            >
              {val}
            </Text>
          </div>
        </Tooltip>
      ),
    },
    {
      title: <FieldLabel>Yaratuvchi</FieldLabel>,
      dataIndex: "yaratuvchi_fio",
      key: "yaratuvchi_fio",
      render: (val: string) => {
        const initials = val
          .split(" ")
          .slice(0, 2)
          .map((w) => w[0])
          .join("");
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
              {initials}
            </div>
            <span className="text-sm text-slate-700 leading-tight">{val}</span>
          </div>
        );
      },
    },
    {
      title: <FieldLabel>Topshiriqlar</FieldLabel>,
      dataIndex: "topshiriqlar_soni",
      key: "topshiriqlar_soni",
      width: 130,
      align: "center",
      render: (val: number) => (
        <Badge
          count={val}
          showZero
          style={{
            backgroundColor: "#6366f1",
            fontWeight: 700,
            fontSize: 12,
            minWidth: 28,
            height: 28,
            lineHeight: "28px",
            borderRadius: 14,
          }}
        />
      ),
    },
    {
      title: <FieldLabel>Bajarilish</FieldLabel>,
      dataIndex: "bajarilish_foizi",
      key: "bajarilish_foizi",
      width: 180,
      render: (val: number) => (
        <div className="min-w-[140px]">
          <div className="mb-1 flex items-center justify-between">
            <span
              className="text-xs font-bold"
              style={{ color: getProgressColor(val) }}
            >
              {val === 100 ? (
                <span className="flex items-center gap-1">
                  <CheckCircleOutlined /> Bajarildi
                </span>
              ) : val === 0 ? (
                <span className="flex items-center gap-1">
                  <ClockCircleOutlined /> Boshlanmagan
                </span>
              ) : (
                `${val}%`
              )}
            </span>
          </div>
          <Progress
            percent={val}
            status={getProgressStatus(val)}
            strokeColor={getProgressColor(val)}
            showInfo={false}
            size="small"
            strokeWidth={6}
            trailColor="#f1f5f9"
          />
        </div>
      ),
    },
    // ── Actions column ──────────────────────────────────────────────────────
    {
      title: <FieldLabel>Amallar</FieldLabel>,
      key: "actions",
      width: 110,
      align: "center",
      render: (_, record) => (
        <Space size={6}>
          {/* PUT trigger */}
          <Tooltip title="Tahrirlash">
            <button
              onClick={() => openEdit(record)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-600 transition hover:bg-amber-100 hover:border-amber-300"
            >
              <EditOutlined style={{ fontSize: 13 }} />
            </button>
          </Tooltip>

          {/* DELETE trigger */}
          <Popconfirm
            title={
              <span className="font-semibold text-slate-800">
                O'chirishni tasdiqlaysizmi?
              </span>
            }
            description={
              <span className="text-slate-500 text-xs">
                «{record.raqami}» bayonnomasi butunlay o'chiriladi.
              </span>
            }
            onConfirm={() => handleDelete(record.id)}
            okText="O'chirish"
            cancelText="Bekor"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="O'chirish">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100 hover:border-red-300">
                <DeleteOutlined style={{ fontSize: 13 }} />
              </button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {contextHolder}

      <div className="min-h-screen bg-slate-50 px-6 py-8">
        {/* ── Header ── */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <AuditOutlined className="text-2xl text-indigo-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                Hujjatlar boshqaruvi
              </span>
            </div>
            <Title
              level={2}
              className="mb-0! font-extrabold! text-slate-900!"
              style={{
                fontFamily: "'Georgia', serif",
                letterSpacing: "-0.5px",
              }}
            >
              Bayonnomalar
            </Title>
            <Text className="text-slate-400 text-sm">
              Barcha yig'ilish bayonnomalarining ro'yxati va holati
            </Text>
          </div>

          <div className="flex items-center gap-3">
            {/* POST trigger */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateOpen(true)}
              className="rounded-xl! h-9! px-5! font-semibold! bg-indigo-600! border-indigo-600! hover:bg-indigo-700!"
            >
              Qo'shish
            </Button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="mb-8 flex gap-4">
          <StatCard
            icon={<FileTextOutlined />}
            label="Jami"
            value={total}
            color="#6366f1"
          />
          <StatCard
            icon={<CheckCircleOutlined />}
            label="Bajarilgan"
            value={completed}
            color="#10b981"
          />
          <StatCard
            icon={<TeamOutlined />}
            label="Topshiriqlar"
            value={totalTasks}
            color="#f59e0b"
          />
          <StatCard
            icon={<ClockCircleOutlined />}
            label="O'rtacha %"
            value={`${avgCompletion}%`}
            color="#3b82f6"
          />
        </div>

        {/* ── Table ── */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              Bayonnomalar ro'yxati
            </span>
            <span className="text-xs text-slate-400">
              {data.length} ta natija ko'rsatilmoqda
            </span>
          </div>

          <Spin spinning={loading} tip="Yuklanmoqda...">
            <Table<Bayonnoma>
              dataSource={data}
              columns={columns}
              rowKey="id"
              onRow={(record) => ({
                onClick: () => navigate(`/bayonnomalar/${record.id}`),
                style: { cursor: "pointer" },
              })}
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (t) => (
                  <span className="text-slate-500 text-xs">
                    Jami {t} ta yozuv
                  </span>
                ),
              }}
              rowClassName={(_, idx) =>
                idx % 2 === 0
                  ? "!bg-white hover:!bg-indigo-50 transition-colors"
                  : "!bg-slate-50/60 hover:!bg-indigo-50 transition-colors"
              }
              className="[&_.ant-table-thead>tr>th]:bg-slate-50! [&_.ant-table-thead>tr>th]:!border-b [&_.ant-table-thead>tr>th]:!border-slate-200 [&_.ant-table-cell]:!py-4 [&_.ant-table-cell]:!align-middle"
              locale={{
                emptyText: (
                  <div className="py-16 text-center">
                    <FileTextOutlined className="mb-3 text-4xl text-slate-300" />
                    <p className="text-slate-400">Bayonnomalar topilmadi</p>
                  </div>
                ),
              }}
            />
          </Spin>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          POST Modal — Create new bayonnoma
      ══════════════════════════════════════════════════════════════ */}
      <Modal
        open={createOpen}
        onCancel={() => {
          setCreateOpen(false);
          createForm.resetFields();
        }}
        onOk={handleCreate}
        confirmLoading={submitting}
        width={640}
        okText="Saqlash"
        cancelText="Bekor"
        okButtonProps={{
          className:
            "!rounded-lg !bg-indigo-600 !border-indigo-600 hover:!bg-indigo-700 !font-semibold",
        }}
        cancelButtonProps={{ className: "!rounded-lg" }}
        title={
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100">
              <PlusOutlined className="text-indigo-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800 mb-0 leading-tight text-base">
                Yangi bayonnoma qo'shish
              </p>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                POST · {API_ENDPOINTS.BAYONNOMALAR.LIST}
              </p>
            </div>
          </div>
        }
        styles={{ body: { paddingTop: 20 } }}
      >
        <Form form={createForm} layout="vertical" size="middle">
          <BaseFormFields />

          {/* ── topshiriqlar (POST-only dynamic field) ── */}
          <div className="mb-3 mt-1">
            <FieldLabel>Topshiriqlar</FieldLabel>
            <p className="text-xs text-slate-400 mt-0.5">
              Har bir topshiriq uchun ixtiyoriy kalit–qiymat xususiyatlar
              qo'shing.
            </p>
          </div>

          <Form.List name="topshiriqlar">
            {(fields, { add, remove }) => (
              <div className="space-y-3">
                {fields.map((field) => (
                  <div
                    key={field.key}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    {/* Topshiriq header */}
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Topshiriq #{field.name + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => remove(field.name)}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
                      >
                        <MinusCircleOutlined /> O'chirish
                      </button>
                    </div>

                    {/* Key-value props for this topshiriq */}
                    <Form.List name={[field.name, "props"]}>
                      {(subFields, { add: addProp, remove: removeProp }) => (
                        <div className="space-y-2">
                          {subFields.map((sub) => (
                            <div
                              key={sub.key}
                              className="flex items-center gap-2"
                            >
                              <Form.Item
                                name={[sub.name, "key"]}
                                className="!mb-0 flex-1"
                              >
                                <Input
                                  placeholder="Kalit (key)"
                                  size="small"
                                  className="!rounded-lg !text-xs !font-mono"
                                />
                              </Form.Item>
                              <Form.Item
                                name={[sub.name, "value"]}
                                className="!mb-0 flex-1"
                              >
                                <Input
                                  placeholder="Qiymat (value)"
                                  size="small"
                                  className="!rounded-lg !text-xs"
                                />
                              </Form.Item>
                              <button
                                type="button"
                                onClick={() => removeProp(sub.name)}
                                className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                              >
                                <MinusCircleOutlined />
                              </button>
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => addProp()}
                            className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 transition-colors"
                          >
                            <PlusCircleOutlined /> Xususiyat qo'shish
                          </button>
                        </div>
                      )}
                    </Form.List>
                  </div>
                ))}

                {/* Add topshiriq button */}
                <button
                  type="button"
                  onClick={() => add()}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 py-3 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 hover:border-indigo-400"
                >
                  <PlusOutlined /> Topshiriq qo'shish
                </button>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════
          PUT Modal — Edit existing bayonnoma
      ══════════════════════════════════════════════════════════════ */}
      <Modal
        open={editOpen}
        onCancel={() => {
          setEditOpen(false);
          setEditTarget(null);
          editForm.resetFields();
        }}
        onOk={handleEdit}
        confirmLoading={submitting}
        width={580}
        okText="Yangilash"
        cancelText="Bekor"
        okButtonProps={{
          className:
            "!rounded-lg !bg-amber-500 !border-amber-500 hover:!bg-amber-600 !font-semibold",
        }}
        cancelButtonProps={{ className: "!rounded-lg" }}
        title={
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
              <EditOutlined className="text-amber-600" />
            </div>
            <div>
              <p className="font-bold text-slate-800 mb-0 leading-tight text-base">
                Bayonnomani tahrirlash
              </p>
              <p className="text-xs text-slate-400 font-normal mt-0.5">
                PUT · {API_ENDPOINTS.BAYONNOMALAR.LIST}
                {editTarget?.id}/
              </p>
            </div>
          </div>
        }
        styles={{ body: { paddingTop: 20 } }}
      >
        <Form form={editForm} layout="vertical" size="middle">
          <BaseFormFields />
        </Form>
      </Modal>
    </>
  );
};

export default BayonnomalarPage;
