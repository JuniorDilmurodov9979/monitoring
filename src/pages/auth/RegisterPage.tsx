// src/pages/auth/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

const BOSHQARMA_OPTIONS = [
  { value: 1, label: "Boshqarma 1" },
  { value: 2, label: "Boshqarma 2" },
  { value: 3, label: "Boshqarma 3" },
];

const LAVOZIM_OPTIONS = [
  { value: "xodim", label: "Xodim" },
  { value: "rahbar", label: "Rahbar" },
  { value: "mutaxassis", label: "Mutaxassis" },
];

function InputField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  focusedField,
  onFocus,
  onBlur,
  glowFrom = "cyan-500",
  glowTo = "blue-500",
  focusBorder = "cyan-500/50",
  focusRing = "cyan-500/20",
  children,
}) {
  const focused = focusedField === id;
  return (
    <div className="group">
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-slate-300 mb-3 tracking-widest uppercase"
      >
        {label}
      </label>
      <div className="relative">
        <div
          className={`absolute inset-0 bg-gradient-to-r from-${glowFrom} to-${glowTo} rounded-2xl blur opacity-0
                      group-hover:opacity-20 transition-opacity duration-500
                      ${focused ? "!opacity-30" : ""}`}
        />
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          className={`w-full px-6 py-4 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50
                     text-slate-100 placeholder-slate-500 rounded-2xl
                     focus:border-${focusBorder} focus:ring-2 focus:ring-${focusRing}
                     transition-all duration-300 outline-none relative z-10
                     font-medium tracking-wide pr-14`}
        />
        {children}
      </div>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  required,
  focusedField,
  onFocus,
  onBlur,
}) {
  const focused = focusedField === id;
  return (
    <div className="group">
      <label
        htmlFor={id}
        className="block text-xs font-semibold text-slate-300 mb-3 tracking-widest uppercase"
      >
        {label}
      </label>
      <div className="relative">
        <div
          className={`absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl blur opacity-0
                      group-hover:opacity-20 transition-opacity duration-500
                      ${focused ? "!opacity-30" : ""}`}
        />
        <select
          id={id}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required={required}
          className="w-full px-6 py-4 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50
                     text-slate-100 rounded-2xl
                     focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20
                     transition-all duration-300 outline-none relative z-10
                     font-medium tracking-wide appearance-none cursor-pointer"
        >
          <option value="" disabled className="bg-slate-900 text-slate-400">
            Tanlang...
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900">
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none text-slate-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    pnfl: "",
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    fio: "",
    boshqarma: "",
    lavozim: "",
    telefon: "",
  });

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const focus = (field) => () => setFocusedField(field);
  const blur = () => setFocusedField(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.password_confirm) {
      setError("Parollar mos kelmaydi");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/v1/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          boshqarma: Number(form.boshqarma),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const messages = Object.values(data).flat().join(" ");
        setError(messages || "Ro'yxatdan o'tishda xatolik yuz berdi");
        return;
      }

      navigate("/auth/login");
    } catch {
      setError("Server bilan bog'lanishda xatolik yuz berdi");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-10 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute top-1/3 right-6 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 left-1/3 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "2s" }}
        />
      </div>

      {/* Header */}
      <div className="text-center my-10 relative z-10">
        <div className="inline-block">
          <h2
            className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent
                       drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]"
          >
            Ro'yxatdan o'tish
          </h2>
          <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
        </div>
        <p className="mt-3 text-slate-400 text-base font-light tracking-wide">
          Barcha maydonlarni to'ldiring
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 mb-5 relative z-10">
        {/* Error */}
        {error && (
          <div className="bg-red-950/30 backdrop-blur-xl border border-red-500/30 text-red-300 rounded-2xl p-4 text-sm
                          shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Row: FIO */}
        <InputField
          id="fio"
          label="F.I.O"
          value={form.fio}
          onChange={set("fio")}
          placeholder="Familiya Ism Otasining ismi"
          required
          focusedField={focusedField}
          onFocus={focus("fio")}
          onBlur={blur}
          glowFrom="emerald-500"
          glowTo="cyan-500"
          focusBorder="emerald-500/50"
          focusRing="emerald-500/20"
        >
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity z-20" />
        </InputField>

        {/* Row: PNFL + Username side by side */}
        <div className="grid grid-cols-2 gap-4">
          <InputField
            id="pnfl"
            label="JSHSHIR"
            value={form.pnfl}
            onChange={set("pnfl")}
            placeholder="14 raqam"
            required
            focusedField={focusedField}
            onFocus={focus("pnfl")}
            onBlur={blur}
            glowFrom="cyan-500"
            glowTo="blue-500"
            focusBorder="cyan-500/50"
            focusRing="cyan-500/20"
          />
          <InputField
            id="username"
            label="Foydalanuvchi nomi"
            value={form.username}
            onChange={set("username")}
            placeholder="username"
            required
            focusedField={focusedField}
            onFocus={focus("username")}
            onBlur={blur}
            glowFrom="cyan-500"
            glowTo="blue-500"
            focusBorder="cyan-500/50"
            focusRing="cyan-500/20"
          />
        </div>

        {/* Email */}
        <InputField
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="email@example.com"
          required
          focusedField={focusedField}
          onFocus={focus("email")}
          onBlur={blur}
          glowFrom="blue-500"
          glowTo="indigo-500"
          focusBorder="blue-500/50"
          focusRing="blue-500/20"
        />

        {/* Telefon */}
        <InputField
          id="telefon"
          label="Telefon"
          type="tel"
          value={form.telefon}
          onChange={set("telefon")}
          placeholder="+998901234567"
          required
          focusedField={focusedField}
          onFocus={focus("telefon")}
          onBlur={blur}
          glowFrom="teal-500"
          glowTo="cyan-500"
          focusBorder="teal-500/50"
          focusRing="teal-500/20"
        />

        {/* Boshqarma + Lavozim */}
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            id="boshqarma"
            label="Boshqarma"
            value={form.boshqarma}
            onChange={set("boshqarma")}
            options={BOSHQARMA_OPTIONS}
            required
            focusedField={focusedField}
            onFocus={focus("boshqarma")}
            onBlur={blur}
          />
          <SelectField
            id="lavozim"
            label="Lavozim"
            value={form.lavozim}
            onChange={set("lavozim")}
            options={LAVOZIM_OPTIONS}
            required
            focusedField={focusedField}
            onFocus={focus("lavozim")}
            onBlur={blur}
          />
        </div>

        {/* Password */}
        <div className="group">
          <label
            htmlFor="password"
            className="block text-xs font-semibold text-slate-300 mb-3 tracking-widest uppercase"
          >
            Parol
          </label>
          <div className="relative">
            <div
              className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0
                          group-hover:opacity-20 transition-opacity duration-500
                          ${focusedField === "password" ? "!opacity-30" : ""}`}
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              onFocus={focus("password")}
              onBlur={blur}
              placeholder="••••••••••••"
              required
              className="w-full px-6 py-4 pr-14 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50
                         text-slate-100 placeholder-slate-500 rounded-2xl
                         focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                         transition-all duration-300 outline-none relative z-10
                         font-medium tracking-wide"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-cyan-300
                         transition-colors z-20 hover:scale-110 duration-200 cursor-pointer"
            >
              {showPassword ? (
                <EyeInvisibleOutlined className="text-xl" />
              ) : (
                <EyeOutlined className="text-xl" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="group">
          <label
            htmlFor="password_confirm"
            className="block text-xs font-semibold text-slate-300 mb-3 tracking-widest uppercase"
          >
            Parolni tasdiqlang
          </label>
          <div className="relative">
            <div
              className={`absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0
                          group-hover:opacity-20 transition-opacity duration-500
                          ${focusedField === "password_confirm" ? "!opacity-30" : ""}`}
            />
            <input
              id="password_confirm"
              type={showConfirm ? "text" : "password"}
              value={form.password_confirm}
              onChange={set("password_confirm")}
              onFocus={focus("password_confirm")}
              onBlur={blur}
              placeholder="••••••••••••"
              required
              className="w-full px-6 py-4 pr-14 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50
                         text-slate-100 placeholder-slate-500 rounded-2xl
                         focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20
                         transition-all duration-300 outline-none relative z-10
                         font-medium tracking-wide"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((p) => !p)}
              className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-cyan-300
                         transition-colors z-20 hover:scale-110 duration-200 cursor-pointer"
            >
              {showConfirm ? (
                <EyeInvisibleOutlined className="text-xl" />
              ) : (
                <EyeOutlined className="text-xl" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full group overflow-hidden rounded-2xl transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600
                          bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
                          translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"
            />
            <div className="relative px-6 py-4 font-bold text-lg tracking-wide cursor-pointer">
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Ro'yxatdan o'tilmoqda...
                </span>
              ) : (
                "Ro'yxatdan o'tish"
              )}
            </div>
          </button>
        </div>

        {/* Login link */}
        <div className="flex items-center justify-center pt-2 gap-2">
          <span className="text-sm text-slate-500">Hisobingiz bormi?</span>
          <Link
            to="/auth/login"
            className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors relative group inline-block"
          >
            <span className="relative z-10">Tizimga kirish</span>
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:w-full transition-all duration-300" />
          </Link>
        </div>
      </form>

      {/* Decorative blobs */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}