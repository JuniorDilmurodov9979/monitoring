import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Tag, Badge, Button, Spin, Divider, Empty, message } from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  BankOutlined,
  CalendarOutlined,
  FileTextOutlined,
  CommentOutlined,
  InfoCircleOutlined,
  PaperClipOutlined,
  UploadOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileUnknownOutlined,
} from "@ant-design/icons";
import api from "@/services/api/axios";
import { API_ENDPOINTS } from "@/services/api/endpoints";

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig = {
  kechikkan: {
    icon: <ExclamationCircleOutlined />,
    antColor: "red",
    bg: "from-red-500 to-rose-600",
  },
  jarayonda: {
    icon: <ClockCircleOutlined />,
    antColor: "blue",
    bg: "from-blue-500 to-indigo-600",
  },
  bajarildi: {
    icon: <CheckCircleOutlined />,
    antColor: "green",
    bg: "from-emerald-500 to-green-600",
  },
};

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, mono = false }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
    <span className="mt-0.5 text-slate-400 text-base flex-shrink-0">
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
        {label}
      </p>
      <p
        className={`text-sm text-slate-800 font-medium break-words ${mono ? "font-mono" : ""}`}
      >
        {value || <span className="text-slate-400 italic">—</span>}
      </p>
    </div>
  </div>
);

// ─── Days Badge ───────────────────────────────────────────────────────────────
const DaysBadge = ({ days, done }) => {
  if (done)
    return (
      <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">
        <CheckCircleOutlined /> Tugallandi
      </span>
    );
  if (days < 0)
    return (
      <span className="inline-flex items-center gap-1.5 bg-red-100 text-red-700 text-sm font-bold px-3 py-1 rounded-full">
        <ExclamationCircleOutlined /> {Math.abs(days)} kun kechikdi
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
      <ClockCircleOutlined /> {days} kun qoldi
    </span>
  );
};

// ─── File Icon ────────────────────────────────────────────────────────────────
const FileIcon = ({ name }) => {
  const ext = name?.split(".").pop()?.toLowerCase();
  if (["pdf"].includes(ext))
    return <FilePdfOutlined className="text-red-500" />;
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return <FileImageOutlined className="text-purple-500" />;
  if (["doc", "docx"].includes(ext))
    return <FileWordOutlined className="text-blue-500" />;
  if (["xls", "xlsx", "csv"].includes(ext))
    return <FileExcelOutlined className="text-green-500" />;
  return <FileUnknownOutlined className="text-slate-400" />;
};

// ─── File Upload Box ──────────────────────────────────────────────────────────
const FileUploadBox = ({ taskId, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [izoh, setIzoh] = useState("");
  const [nomi, setNomi] = useState("");
  const [bajarildi, setBajarildi] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!nomi) setNomi(selected.name);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      if (!nomi) setNomi(dropped.name);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = async () => {
    if (!file || submitting) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("fayl", file);
      if (izoh) formData.append("izoh", izoh);
      if (nomi) formData.append("nomi", nomi);
      formData.append("bajarildi", bajarildi);

      await api.post(`${API_ENDPOINTS.TOPSHIRIQLAR.LIST}${taskId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Fayl muvaffaqiyatli yuklandi!");
      setFile(null);
      setIzoh("");
      setNomi("");
      setBajarildi(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onSuccess();
    } catch (err) {
      console.error(err);
      message.error("Fayl yuklashda xatolik yuz berdi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
        <h2 className="px-5 py-3.5 border-b border-slate-100 text-slate-800 font-semibold">
          Topshiriqni yuklash
        </h2>
        {/* Header */}
        {/* <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 bg-white">
          <PaperClipOutlined className="text-indigo-500" />
          <span className="text-slate-700 font-semibold text-sm">
            Fayl yuklash
          </span>
        </div> */}

        <div className="p-5 space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
            className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
            ${
              dragOver
                ? "border-indigo-400 bg-indigo-50"
                : file
                  ? "border-emerald-300 bg-emerald-50 cursor-default"
                  : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-lg shadow-sm flex-shrink-0">
                  <FileIcon name={file.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                >
                  <DeleteOutlined style={{ fontSize: 12 }} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-3">
                  <UploadOutlined className="text-indigo-500 text-xl" />
                </div>
                <p className="text-sm font-medium text-slate-600">
                  Faylni bu yerga tashlang
                </p>
                <p className="text-xs text-slate-400 mt-1 flex gap-1 items-center">
                  yoki
                  <span className="text-indigo-600 font-semibold underline underline-offset-2">
                    kompyuterdan tanlang
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Optional fields */}
          <div className="space-y-3">
            {/* Nomi */}
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wide font-medium mb-1.5">
                Nomi{" "}
                <span className="normal-case text-slate-300">(ixtiyoriy)</span>
              </label>
              <input
                type="text"
                value={nomi}
                onChange={(e) => setNomi(e.target.value)}
                placeholder="Fayl nomi..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 focus:bg-white transition-all"
              />
            </div>

            {/* Izoh */}
            <div>
              <label className="block text-xs text-slate-400 uppercase tracking-wide font-medium mb-1.5">
                Izoh{" "}
                <span className="normal-case text-slate-300">(ixtiyoriy)</span>
              </label>
              <textarea
                value={izoh}
                onChange={(e) => setIzoh(e.target.value)}
                placeholder="Bu fayl haqida izoh..."
                rows={2}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Bajarildi toggle */}
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-200">
              <div>
                <p className="text-sm font-medium text-slate-700">Bajarildi</p>
                <p className="text-xs text-slate-400">
                  Topshiriq bajarilgan deb belgilash
                </p>
              </div>
              <button
                onClick={() => setBajarildi((v) => !v)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                  bajarildi ? "bg-indigo-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    bajarildi ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!file || submitting}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 flex items-center justify-center gap-2 ${
              file && !submitting
                ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-200 cursor-pointer"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Yuklanmoqda...
              </>
            ) : (
              <>
                <UploadOutlined />
                Yuklash
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Chat Comment Box ─────────────────────────────────────────────────────────
const ChatCommentBox = ({ taskData, onSuccess }) => {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await api.post(
        `${API_ENDPOINTS.TOPSHIRIQLAR.LIST}${taskData.id}/izoh_qoshish/`,
        {
          bayonnoma: taskData.bayonnoma,
          ijrochi_boshqarma: taskData.ijrochi_boshqarma,
          ijrochi_xodim: taskData.ijrochi_xodim,
          band_raqami: taskData.band_raqami,
          mazmun: taskData.mazmun,
          muddat: taskData.muddat,
          holat: taskData.holat,
          bajarildi: taskData.bajarildi,
          natija: taskData.natija || "",
          matn: trimmed,
        },
      );
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "24px";
        textareaRef.current.focus();
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const canSend = text.trim().length > 0 && !submitting;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border-t border-slate-100">
      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 flex-shrink-0 mb-0.5">
        <UserOutlined style={{ fontSize: 13 }} />
      </div>
      <div
        className={`flex-1 flex items-end gap-2 bg-slate-50 border rounded-2xl px-3.5 py-2 transition-all duration-150 ${
          text
            ? "border-indigo-400 ring-2 ring-indigo-50 bg-white"
            : "border-slate-200"
        }`}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Izoh yozing…   Enter — yuborish · Shift+Enter — yangi qator"
          rows={1}
          disabled={submitting}
          className="flex-1 resize-none bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none leading-relaxed py-0.5 max-h-[120px] overflow-y-auto"
          style={{ height: "24px" }}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={!canSend}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
          canSend
            ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-indigo-200 hover:scale-105 cursor-pointer"
            : "bg-slate-100 text-slate-300 cursor-not-allowed"
        }`}
      >
        {submitting ? (
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        )}
      </button>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const TopshiriqDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`${API_ENDPOINTS.TOPSHIRIQLAR.LIST}${id}/`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/bayonnomalar/topshiriqlar/${id}/`);
      message.success("Topshiriq o'chirildi");
      navigate(-1);
    } catch (error) {
      console.error(error);
      message.error("O'chirishda xatolik yuz berdi");
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data?.izohlar?.length]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Spin size="large" tip="Yuklanmoqda..." />
      </div>
    );

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Empty description="Topshiriq topilmadi" />
      </div>
    );

  const cfg = statusConfig[data.holat] || statusConfig.jarayonda;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ── Hero Header ── */}
      <div className={`bg-gradient-to-r ${cfg.bg} shadow-lg rounded-t-xl`}>
        <div className="max-w-7xl mx-auto  px-6 pt-5 pb-8">
          <div className="mb-5 flex items-center justify-between">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              className=" border-white/30 text-white hover:bg-white/20 hover:text-white hover:border-white/50 bg-white/10"
              ghost
            >
              Orqaga
            </Button>
            <Button
              icon={<DeleteOutlined />}
              className=""
              onClick={handleDelete}
              type="primary"
              danger
            >
              O'chirish
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">
                  Topshiriq
                </span>
              </div>
              <h1 className="text-2xl max-h-[300px] overflow-y-auto sm:text-3xl font-bold text-white leading-snug w-[90%]">
                {data.mazmun}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Tag
                  icon={cfg.icon}
                  className="border-0 text-white text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.25)" }}
                >
                  {data.holat_display}
                </Tag>
                <DaysBadge days={data.qolgan_kunlar} done={data.bajarildi} />
              </div>
            </div>
            <div className="sm:text-right flex-shrink-0">
              <p className="text-white/60 text-xs uppercase tracking-wide">
                Bayonnoma raqami
              </p>
              <p className="font-mono text-white text-2xl font-bold">
                {data.bayonnoma_raqami}
              </p>
              <p className="text-white/60 text-xs mt-1">
                Band №{" "}
                <span className="text-white font-semibold">
                  {data.band_raqami}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-6 -mt-4 pb-10 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="md:col-span-2 space-y-5">
            {/* Main info */}
            <Card
              className="rounded-2xl border border-slate-200 shadow-sm"
              title={
                <span className="text-slate-700 font-semibold flex items-center gap-2">
                  <InfoCircleOutlined className="text-indigo-500" /> Asosiy
                  ma'lumotlar
                </span>
              }
            >
              <InfoRow
                icon={<FileTextOutlined />}
                label="Bayonnoma raqami"
                value={data.bayonnoma_raqami}
                mono
              />
              <InfoRow
                icon={<BankOutlined />}
                label="Ijrochi boshqarma"
                value={data.ijrochi_boshqarma_nomi}
              />
              <InfoRow
                icon={<UserOutlined />}
                label="Ijrochi xodim"
                value={data.ijrochi_xodim_fio}
              />
              <InfoRow
                icon={<CalendarOutlined />}
                label="Muddat"
                value={data.muddat}
              />
              <InfoRow
                icon={<CalendarOutlined />}
                label="Yaratilgan sana"
                value={new Date(data.created_at).toLocaleString("uz-UZ")}
              />
              {data.bajarildi_sana && (
                <InfoRow
                  icon={<CheckCircleOutlined />}
                  label="Bajarilgan sana"
                  value={new Date(data.bajarildi_sana).toLocaleString("uz-UZ")}
                />
              )}
            </Card>

            {/* Natija & Izoh */}
            {(data.natija || data.izoh) && (
              <Card
                className="rounded-2xl mt-5! border border-slate-200 shadow-sm"
                title={
                  <span className="text-slate-700 font-semibold flex items-center gap-2">
                    <CommentOutlined className="text-indigo-500" /> Natija va
                    izoh
                  </span>
                }
              >
                {data.natija && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">
                      Natija
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">
                      {data.natija}
                    </p>
                  </div>
                )}
                {data.izoh && (
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">
                      Izoh
                    </p>
                    <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">
                      {data.izoh}
                    </p>
                  </div>
                )}
              </Card>
            )}

            {/* ── Chat-style comments ── */}
            <div className="rounded-2xl mt-5 border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 bg-white">
                <CommentOutlined className="text-indigo-500" />
                <span className="text-slate-700 font-semibold text-sm">
                  Chatting
                </span>
                <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {data.izohlar?.length || 0}
                </span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto max-h-[400px] px-4 py-4 space-y-4 bg-slate-50/50">
                {data.izohlar && data.izohlar.length > 0 ? (
                  <>
                    {data.izohlar.map((izoh) => (
                      <div key={izoh.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                          {izoh.muallif_fio
                            ? izoh.muallif_fio.charAt(0).toUpperCase()
                            : "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xs font-semibold text-slate-700">
                              {izoh.muallif_fio || "Noma'lum"}
                            </span>
                            {izoh.created_at && (
                              <span className="text-xs text-slate-400">
                                {new Date(izoh.created_at).toLocaleString(
                                  "uz-UZ",
                                )}
                              </span>
                            )}
                          </div>
                          <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm inline-block max-w-full">
                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
                              {izoh.matn || izoh.text || izoh.izoh || (
                                <span className="text-slate-400 italic">
                                  Izoh matni yo'q
                                </span>
                              )}
                            </p>
                            {izoh.fayl && (
                              <a
                                href={izoh.fayl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-2 text-sm text-indigo-600 font-semibold"
                              >
                                <PaperClipOutlined />
                                Faylni ko'rish
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <CommentOutlined
                        className="text-slate-400"
                        style={{ fontSize: 22 }}
                      />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">
                      Hali izohlar yo'q
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Birinchi izohni qoldiring!
                    </p>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <ChatCommentBox taskData={data} onSuccess={fetchDetail} />
            </div>

            {/* ── File Upload ── */}
            <FileUploadBox taskId={id} onSuccess={fetchDetail} />
          </div>

          {/* Right sidebar */}
          <div className="space-y-5!">
            <Card
              className="rounded-2xl border border-slate-200 shadow-sm"
              bodyStyle={{ padding: "20px" }}
            >
              <p className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-3">
                Holat
              </p>
              <Tag
                icon={cfg.icon}
                color={cfg.antColor}
                className="text-sm font-semibold px-3 py-1! rounded-lg w-full flex items-center justify-center gap-2"
              >
                {data.holat_display}
              </Tag>

              <Divider className="my-4" />

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Bajarildi</span>
                  <Badge
                    status={data.bajarildi ? "success" : "default"}
                    text={
                      <span
                        className={`text-xs font-semibold ${data.bajarildi ? "text-green-600" : "text-slate-400"}`}
                      >
                        {data.bajarildi ? "Ha" : "Yo'q"}
                      </span>
                    }
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Kechikkan</span>
                  <Badge
                    status={data.is_kechikkan ? "error" : "success"}
                    text={
                      <span
                        className={`text-xs font-semibold ${data.is_kechikkan ? "text-red-600" : "text-green-600"}`}
                      >
                        {data.is_kechikkan ? "Ha" : "Yo'q"}
                      </span>
                    }
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Qolgan kunlar</span>
                  <span
                    className={`text-xs font-bold ${data.qolgan_kunlar < 0 ? "text-red-600" : "text-blue-600"}`}
                  >
                    {data.qolgan_kunlar > 0 ? "+" : ""}
                    {data.qolgan_kunlar} kun
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopshiriqDetailPage;
