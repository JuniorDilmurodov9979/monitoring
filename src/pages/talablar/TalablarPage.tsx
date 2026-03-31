import { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Badge,
  Input,
  Select,
  Button,
  Tooltip,
  Space,
  Card,
  Statistic,
  Typography,
  Skeleton,
  Modal,
  Form,
  DatePicker,
  notification,
  Tabs,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  FileTextOutlined,
  PlusOutlined,
  SendOutlined,
  InboxOutlined,
  UnorderedListOutlined,
  CheckOutlined,
  CloseOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import api from "@/services/api/axios";
import Can from "@/shared/components/guards/Can";
import { usePermissions } from "@/features/auth/hooks/usePermissions";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ── Types ──────────────────────────────────────────────────────────────────────

interface Talab {
  id: number;
  mavzu: string;
  sorovchi_boshqarma_nomi: string;
  ijrochi_boshqarma_nomi: string;
  status: string;
  status_display: string;
  muddat: string;
  is_kechikkan: boolean;
  created_at: string;
}

interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface TalabCreatePayload {
  ijrochi_boshqarma: number;
  kategoriya: number;
  mavzu: string;
  mazmun: string;
  muddat: string;
}

interface Boshqarma {
  id: number;
  nomi: string;
  qisqa_nomi: string;
  reyting: number;
  xodimlar_soni: number;
}

interface Kategoriya {
  id: number;
  nomi: string;
  boshqarma: number;
  boshqarma_nomi: string;
  parent: number | null;
  tartib: number;
  tavsif: string;
  full_path: string;
  children: Kategoriya[];
  hujjatlar_soni: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function fetchAllPages<T>(endpoint: string): Promise<T[]> {
  const results: T[] = [];
  let url: string | null = endpoint;

  while (url) {
    const path = url.includes("/api/v1/") ? url.split("/api/v1/")[1] : url;
    const res = await api.get<ApiResponse<T>>(path);
    results.push(...res.data.results);
    url = res.data.next;
  }

  return results;
}

// ── Status config ──────────────────────────────────────────────────────────────

const statusConfig: Record<
  string,
  { color: string; icon: React.ReactNode; bg: string; border: string }
> = {
  qabul_qilindi: {
    color: "#1677ff",
    icon: <CheckCircleOutlined />,
    bg: "#e6f4ff",
    border: "#91caff",
  },
  jarayonda: {
    color: "#fa8c16",
    icon: <SyncOutlined spin />,
    bg: "#fff7e6",
    border: "#ffd591",
  },
  bajarildi: {
    color: "#52c41a",
    icon: <CheckCircleOutlined />,
    bg: "#f6ffed",
    border: "#b7eb8f",
  },
  kutilmoqda: {
    color: "#8c8c8c",
    icon: <ClockCircleOutlined />,
    bg: "#fafafa",
    border: "#d9d9d9",
  },
  yangi: {
    color: "#722ed1",
    icon: <FileTextOutlined />,
    bg: "#f9f0ff",
    border: "#d3adf7",
  },
  rad_etildi: {
    color: "#ff4d4f",
    icon: <CloseOutlined />,
    bg: "#fff1f0",
    border: "#ffa39e",
  },
};

// Status-based action guards
const canQabulQilish = (status: string) => status === "yangi";
const canRadEtish = (status: string) => status === "yangi";
const canBajarish = (status: string) =>
  status === "qabul_qilindi" || status === "jarayonda";

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

// ── Reusable TalabTable ────────────────────────────────────────────────────────

interface TalabTableProps {
  data: Talab[];
  loading: boolean;
  showActions?: boolean;
  onUpdateRecord?: (updated: Talab) => void;
}

const TalabTable = ({
  data,
  loading,
  showActions = false,
  onUpdateRecord,
}: TalabTableProps) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {},
  );
  const [notifApi, contextHolder] = notification.useNotification();

  const { role } = usePermissions();

  const setLoadingKey = (id: number, action: string, val: boolean) =>
    setActionLoading((prev) => ({ ...prev, [`${id}_${action}`]: val }));

  const isLoadingKey = (id: number, action: string) =>
    !!actionLoading[`${id}_${action}`];

  const runAction = async (
    id: number,
    action: "qabul_qilish" | "rad_etish" | "bajarish",
  ) => {
    setLoadingKey(id, action, true);
    try {
      const res = await api.post<Talab>(`talablar/${id}/${action}/`);
      onUpdateRecord?.(res.data);
      const labels = {
        qabul_qilish: "Talab qabul qilindi",
        rad_etish: "Talab rad etildi",
        bajarish: "Talab bajarildi deb belgilandi",
      };
      notifApi.success({ message: labels[action], placement: "topRight" });
    } catch {
      notifApi.error({
        message: "Xatolik",
        description: "Amalni bajarishda muammo bo'ldi.",
        placement: "topRight",
      });
    } finally {
      setLoadingKey(id, action, false);
    }
  };

  const filtered = data.filter((item) => {
    const matchSearch =
      item.mavzu.toLowerCase().includes(search.toLowerCase()) ||
      item.sorovchi_boshqarma_nomi
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      item.ijrochi_boshqarma_nomi.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const actionsColumn: ColumnsType<Talab>[number] = {
    title: "",
    key: "actions",
    width: 120,
    render: (_, record) => {
      const hasAny =
        canQabulQilish(record.status) ||
        canRadEtish(record.status) ||
        canBajarish(record.status);

      if (!hasAny) return null;

      return role !== "rais" ? (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          {canQabulQilish(record.status) && (
            <Tooltip title="Qabul qilish">
              <Popconfirm
                title="Talabni qabul qilasizmi?"
                okText="Ha"
                cancelText="Yo'q"
                onConfirm={() => runAction(record.id, "qabul_qilish")}
                okButtonProps={{ className: "bg-blue-500" }}
              >
                <Button
                  size="small"
                  type="text"
                  loading={isLoadingKey(record.id, "qabul_qilish")}
                  icon={<CheckOutlined />}
                  className="!text-blue-500 hover:!bg-blue-50 !border !border-blue-200 rounded-lg"
                />
              </Popconfirm>
            </Tooltip>
          )}

          {canRadEtish(record.status) && (
            <Tooltip title="Rad etish">
              <Popconfirm
                title="Talabni rad etasizmi?"
                okText="Ha"
                cancelText="Yo'q"
                okType="danger"
                onConfirm={() => runAction(record.id, "rad_etish")}
              >
                <Button
                  size="small"
                  type="text"
                  loading={isLoadingKey(record.id, "rad_etish")}
                  icon={<CloseOutlined />}
                  className="!text-red-500 hover:!bg-red-50 !border !border-red-200 rounded-lg"
                />
              </Popconfirm>
            </Tooltip>
          )}

          {canBajarish(record.status) && (
            <Tooltip title="Bajarildi deb belgilash">
              <Popconfirm
                title="Talab bajarildi deb belgilansinmi?"
                okText="Ha"
                cancelText="Yo'q"
                onConfirm={() => runAction(record.id, "bajarish")}
                okButtonProps={{ className: "bg-green-500" }}
              >
                <Button
                  size="small"
                  type="text"
                  loading={isLoadingKey(record.id, "bajarish")}
                  icon={<PlayCircleOutlined />}
                  className="!text-green-600 hover:!bg-green-50 !border !border-green-200 rounded-lg"
                />
              </Popconfirm>
            </Tooltip>
          )}
        </div>
      ) : null;
    },
  };

  const baseColumns: ColumnsType<Talab> = [
    {
      title: "№",
      dataIndex: "id",
      key: "id",
      width: 60,
      render: (id) => (
        <span className="font-mono text-xs text-gray-400 font-semibold">
          #{id}
        </span>
      ),
    },
    {
      title: "Mavzu",
      dataIndex: "mavzu",
      key: "mavzu",
      render: (mavzu, record) => (
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-medium text-gray-800 text-sm">{mavzu}</div>
            <div className="text-xs text-gray-400 mt-0.5">
              {formatDate(record.created_at)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "So'rovchi bo'lim",
      dataIndex: "sorovchi_boshqarma_nomi",
      key: "sorovchi",
      render: (val) => (
        <span className="text-sm text-gray-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
          {val}
        </span>
      ),
    },
    {
      title: "Ijrochi bo'lim",
      dataIndex: "ijrochi_boshqarma_nomi",
      key: "ijrochi",
      render: (val) => (
        <span className="text-sm text-gray-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
          {val}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status, record) => {
        const cfg = statusConfig[status] || statusConfig.kutilmoqda;
        return (
          <Tag
            icon={cfg.icon}
            style={{
              color: cfg.color,
              background: cfg.bg,
              borderColor: cfg.border,
              borderRadius: 20,
              padding: "2px 10px",
              fontWeight: 500,
              fontSize: 12,
            }}
          >
            {record.status_display}
          </Tag>
        );
      },
    },
    {
      title: "Muddat",
      dataIndex: "muddat",
      key: "muddat",
      width: 150,
      render: (muddat, record) => (
        <div className="flex items-center gap-1.5">
          {record.is_kechikkan ? (
            <Tooltip title="Muddat o'tib ketgan">
              <div className="flex items-center gap-1 bg-red-50 border border-red-200 text-red-500 rounded-lg px-2 py-1 text-xs font-medium">
                <ExclamationCircleOutlined />
                <span>{formatDate(muddat)}</span>
              </div>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-1 bg-green-50 border border-green-200 text-green-600 rounded-lg px-2 py-1 text-xs font-medium">
              <ClockCircleOutlined />
              <span>{formatDate(muddat)}</span>
            </div>
          )}
        </div>
      ),
    },
  ];

  const columns = showActions ? [...baseColumns, actionsColumn] : baseColumns;

  return (
    <>
      {contextHolder}

      {/* Filters */}
      <Card
        className="!border-slate-200 !shadow-sm mb-4"
        bodyStyle={{ padding: "12px 16px" }}
      >
        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Mavzu yoki bo'lim bo'yicha qidiring..."
            prefix={<SearchOutlined className="text-gray-300" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
            allowClear
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 170 }}
            suffixIcon={<FilterOutlined className="text-gray-400" />}
          >
            <Option value="all">Barcha statuslar</Option>
            <Option value="yangi">Yangi</Option>
            <Option value="qabul_qilindi">Qabul qilindi</Option>
            <Option value="jarayonda">Jarayonda</Option>
            <Option value="bajarildi">Bajarildi</Option>
            <Option value="kutilmoqda">Kutilmoqda</Option>
            <Option value="rad_etildi">Rad etildi</Option>
          </Select>
          <Space className="ml-auto">
            <Badge
              count={filtered.length}
              showZero
              style={{ backgroundColor: "#1677ff" }}
            >
              <span className="text-xs text-gray-400 pr-2">natija</span>
            </Badge>
          </Space>
        </div>
      </Card>

      {/* Table */}
      <Card className="!border-slate-200 !shadow-sm" bodyStyle={{ padding: 0 }}>
        {loading ? (
          <div className="p-6">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : (
          <Table
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            onRow={(record) => ({
              onClick: () => navigate(`/talablar/${record.id}`),
              style: { cursor: "pointer" },
            })}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
              showTotal: (total) => (
                <span className="text-gray-400 text-sm">
                  Jami: <strong>{total}</strong> ta talab
                </span>
              ),
            }}
            rowClassName={(record) =>
              record.is_kechikkan
                ? "bg-red-50/40 hover:bg-red-50"
                : "hover:bg-blue-50/30"
            }
            className="[&_.ant-table-thead_th]:bg-slate-50 [&_.ant-table-thead_th]:text-gray-500 [&_.ant-table-thead_th]:text-xs [&_.ant-table-thead_th]:font-semibold [&_.ant-table-thead_th]:uppercase [&_.ant-table-thead_th]:tracking-wide [&_.ant-table-thead_th]:border-b [&_.ant-table-thead_th]:border-slate-200"
            locale={{
              emptyText: (
                <div className="py-12 text-center text-gray-400">
                  <FileTextOutlined className="text-4xl mb-3 opacity-30" />
                  <div>Ma'lumot topilmadi</div>
                </div>
              ),
            }}
          />
        )}
      </Card>
    </>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const Talablar = () => {
  const [allData, setAllData] = useState<Talab[]>([]);
  const [yuborgan, setYuborgan] = useState<Talab[]>([]);
  const [kelgan, setKelgan] = useState<Talab[]>([]);

  const [allLoading, setAllLoading] = useState(true);
  const [yuborganLoading, setYuborganLoading] = useState(true);
  const [kelganLoading, setKelganLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("kelgan");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [notifApi, contextHolder] = notification.useNotification();

  const [boshqarmalar, setBoshqarmalar] = useState<Boshqarma[]>([]);
  const [kategoriyalar, setKategoriyalar] = useState<Kategoriya[]>([]);
  const [formDataLoading, setFormDataLoading] = useState(false);
  const { role } = usePermissions();

  useEffect(() => {
    api
      .get<ApiResponse<Talab>>("talablar/")
      .then((res) => setAllData(res.data.results))
      .catch(() =>
        notifApi.error({
          message: "Xatolik",
          description: "Talablarni yuklashda muammo bo'ldi.",
          placement: "topRight",
        }),
      )
      .finally(() => setAllLoading(false));

    api
      .get<Talab[]>("talablar/yuborgan/")
      .then((res) => setYuborgan(res.data))
      .catch(() =>
        notifApi.error({
          message: "Xatolik",
          description: "Yuborgan talablarni yuklashda muammo bo'ldi.",
          placement: "topRight",
        }),
      )
      .finally(() => setYuborganLoading(false));

    api
      .get<Talab[]>("talablar/kelgan/")
      .then((res) => setKelgan(res.data))
      .catch(() =>
        notifApi.error({
          message: "Xatolik",
          description: "Kelgan talablarni yuklashda muammo bo'ldi.",
          placement: "topRight",
        }),
      )
      .finally(() => setKelganLoading(false));
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    if (boshqarmalar.length > 0 && kategoriyalar.length > 0) return;

    setFormDataLoading(true);
    Promise.all([
      fetchAllPages<Boshqarma>("core/boshqarmalar/"),
      fetchAllPages<Kategoriya>("hujjatlar/kategoriyalar/"),
    ])
      .then(([boshs, kats]) => {
        setBoshqarmalar(boshs);
        setKategoriyalar(kats);
      })
      .catch(() =>
        notifApi.error({
          message: "Ma'lumot yuklashda xatolik",
          description: "Bo'limlar yoki kategoriyalarni yuklab bo'lmadi.",
          placement: "topRight",
        }),
      )
      .finally(() => setFormDataLoading(false));
  }, [modalOpen]);

  /** Sync updated record across all three lists */
  const handleUpdateRecord = (updated: Talab) => {
    const patch = (list: Talab[]) =>
      list.map((t) => (t.id === updated.id ? updated : t));
    setAllData(patch);
    setYuborgan(patch);
    setKelgan(patch);
  };

  const handleCreate = async (values: TalabCreatePayload) => {
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        muddat: values.muddat
          ? (values.muddat as any).format("YYYY-MM-DD")
          : undefined,
      };

      const res = await api.post<Talab>("talablar/", payload);
      setAllData((prev) => [res.data, ...prev]);
      setYuborgan((prev) => [res.data, ...prev]);
      notifApi.success({
        message: "Talab muvaffaqiyatli yaratildi",
        description: `"${values.mavzu}" talabi qo'shildi.`,
        placement: "topRight",
      });
      form.resetFields();
      setModalOpen(false);
    } catch {
      notifApi.error({
        message: "Xatolik yuz berdi",
        description:
          "Talabni yaratishda muammo bo'ldi. Qaytadan urinib ko'ring.",
        placement: "topRight",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const allStats = {
    total: allData.length,
    kechikkan: allData.filter((d) => d.is_kechikkan).length,
    jarayonda: allData.filter((d) => d.status === "jarayonda").length,
    bajarildi: allData.filter((d) => d.status === "bajarildi").length,
  };

  const tabItems = [
    {
      key: "all",
      label: (
        <Can action="rais">
          <span className="flex items-center gap-1.5">
            <UnorderedListOutlined />
            Barcha talablar
            <Badge
              count={allData.length}
              showZero
              style={{ backgroundColor: "#1677ff", marginLeft: 4 }}
              size="small"
            />
          </span>
        </Can>
      ),
      children: (
        <Can action="rais">
          <TalabTable
            data={allData}
            loading={allLoading}
            showActions
            onUpdateRecord={handleUpdateRecord}
          />
        </Can>
      ),
    },
    {
      key: "yuborgan",
      label: (
        <span className="flex items-center gap-1.5">
          <SendOutlined />
          Yuborgan
          <Badge
            count={yuborgan.length}
            showZero
            style={{ backgroundColor: "#722ed1", marginLeft: 4 }}
            size="small"
          />
        </span>
      ),
      children: (
        // No actions on sent items — user is the requester, not the executor
        <TalabTable data={yuborgan} loading={yuborganLoading} />
      ),
    },
    {
      key: "kelgan",
      label: (
        <span className="flex items-center gap-1.5">
          <InboxOutlined />
          Kelgan
          <Badge
            count={kelgan.length}
            showZero
            style={{ backgroundColor: "#52c41a", marginLeft: 4 }}
            size="small"
          />
        </span>
      ),
      children: (
        <TalabTable
          data={kelgan}
          loading={kelganLoading}
          showActions
          onUpdateRecord={handleUpdateRecord}
        />
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6 rounded-xl">
      {contextHolder}

      {/* Create Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pb-1">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <PlusOutlined className="text-white! text-xs" />
            </div>
            <span className="font-semibold text-gray-800">
              Yangi talab yaratish
            </span>
          </div>
        }
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={560}
        className="[&_.ant-modal-content]:rounded-2xl [&_.ant-modal-header]:rounded-t-2xl"
        destroyOnClose
      >
        <Skeleton active loading={formDataLoading} paragraph={{ rows: 6 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleCreate}
            className="pt-2"
            requiredMark={false}
          >
            <Form.Item
              label={
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Mavzu
                </span>
              }
              name="mavzu"
              rules={[{ required: true, message: "Mavzuni kiriting" }]}
            >
              <Input
                placeholder="Talab mavzusini kiriting..."
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                label={
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Ijrochi bo'lim
                  </span>
                }
                name="ijrochi_boshqarma"
                rules={[{ required: true, message: "Bo'limni tanlang" }]}
              >
                <Select
                  placeholder="Bo'limni tanlang"
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  className="rounded-lg"
                >
                  {boshqarmalar.map((b) => (
                    <Option key={b.id} value={b.id}>
                      {b.nomi}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label={
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Kategoriya
                  </span>
                }
                name="kategoriya"
              >
                <Select
                  placeholder="Kategoriya"
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  className="rounded-lg"
                >
                  {kategoriyalar.map((k) => (
                    <Option key={k.id} value={k.id}>
                      {k.boshqarma_nomi || k.nomi}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              label={
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Mazmun
                </span>
              }
              name="mazmun"
              rules={[{ required: true, message: "Mazmunni kiriting" }]}
            >
              <TextArea
                placeholder="Talab mazmunini batafsil yozing..."
                rows={4}
                className="rounded-lg resize-none"
              />
            </Form.Item>

            <Form.Item
              label={
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Muddat
                </span>
              }
              name="muddat"
              rules={[{ required: true, message: "Muddatni tanlang" }]}
            >
              <DatePicker
                placeholder="Sanani tanlang"
                size="large"
                className="w-full rounded-lg"
                format="YYYY-MM-DD"
                disabledDate={(current) =>
                  current && current < new Date().setHours(0, 0, 0, 0)
                }
              />
            </Form.Item>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-100 mt-2">
              <Button
                onClick={() => {
                  setModalOpen(false);
                  form.resetFields();
                }}
                className="border-slate-200 text-gray-500 rounded-lg px-5"
                size="large"
              >
                Bekor qilish
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                icon={<PlusOutlined />}
                size="large"
                className="rounded-lg px-6 bg-blue-500 hover:bg-blue-600 border-0 shadow-sm"
              >
                Yaratish
              </Button>
            </div>
          </Form>
        </Skeleton>
      </Modal>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <Title level={3} className="mb-0! text-gray-800!">
              Talablar
            </Title>
            <Text className="text-gray-400 text-sm">
              Barcha so'rovlar va talablar ro'yxati
            </Text>
          </div>
          <Space>
            {role !== "rais" && (
              <Can action="canCreate">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setModalOpen(true)}
                  className="bg-blue-500 hover:bg-blue-600 border-0 shadow-sm rounded-lg!"
                >
                  Yangi talab
                </Button>
              </Can>
            )}
            <Can action="canCreateTalab">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 border-0 shadow-sm rounded-lg!"
              >
                Yangi talab
              </Button>
            </Can>
          </Space>
        </div>
      </div>

      {/* Stats — only for canCreate role */}
      <Can action="canCreate">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Jami talablar",
              value: allStats.total,
              color: "#1677ff",
              bg: "from-blue-500 to-indigo-500",
            },
            {
              label: "Jarayonda",
              value: allStats.jarayonda,
              color: "#fa8c16",
              bg: "from-orange-400 to-amber-400",
            },
            {
              label: "Bajarildi",
              value: allStats.bajarildi,
              color: "#52c41a",
              bg: "from-green-400 to-emerald-500",
            },
            {
              label: "Kechikkan",
              value: allStats.kechikkan,
              color: "#ff4d4f",
              bg: "from-red-400 to-rose-500",
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              className="border-0! shadow-sm! overflow-hidden relative"
              bodyStyle={{ padding: "16px 20px" }}
            >
              <div
                className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.bg}`}
              />
              <Statistic
                title={
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                    {stat.label}
                  </span>
                }
                value={allLoading ? "-" : stat.value}
                valueStyle={{
                  color: stat.color,
                  fontSize: 28,
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              />
            </Card>
          ))}
        </div>
      </Can>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        className="[&_.ant-tabs-nav]:mb-4 [&_.ant-tabs-tab]:font-medium [&_.ant-tabs-tab]:text-gray-500 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:text-blue-600 mx-0!"
        tabBarStyle={{
          background: "white",
          padding: "0 16px",
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          marginBottom: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      />
    </div>
  );
};

export default Talablar;
