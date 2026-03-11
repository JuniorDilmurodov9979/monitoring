// src/pages/auth/LoginPage.jsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<
    "username" | "password" | null
  >(null);
  const { login, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await login({ username, password });

    if (result.success) {
      navigate("/");
    }
  };

  return (
    <div className="w-full relative">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute bottom-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "2s" }}
        />
      </div>

      {/* Header with glowing effect */}
      <div className="text-center mb-12 relative z-10">
        <div className="inline-block">
          <h2
            className="text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent
                         drop-shadow-[0_0_25px_rgba(34,211,238,0.3)]
                         animate-[shimmer_3s_ease-in-out_infinite]"
            style={{
              backgroundSize: "200% auto",
            }}
          >
            Xush kelibsiz
          </h2>
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
        </div>
        <p className="mt-4 text-slate-400 text-lg font-light tracking-wide">
          Tizimga kirish uchun hisob ma'lumotlaringizni kiriting
        </p>
      </div>

      {/* Glass morphism form */}
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {/* Error Message with slide-in animation */}
        {error && (
          <div
            className="bg-red-950/30 backdrop-blur-xl border border-red-500/30 text-red-300 rounded-2xl p-4 text-sm
                          animate-[slideIn_0.3s_ease-out]
                          shadow-[0_0_30px_rgba(239,68,68,0.15)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span className="font-medium">
                Foydalanuvchi nomi yoki Parol noto'g'ri
              </span>
            </div>
          </div>
        )}

        {/* Email Field with glow effect */}
        <div className="group">
          <label
            htmlFor="username"
            className="block text-sm font-semibold text-slate-300 mb-3 tracking-wide uppercase text-xs"
          >
            Foydalanuvchi nomi
          </label>
          <div className="relative">
            <div
              className={`absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-0 
                            group-hover:opacity-20 transition-opacity duration-500
                            ${focusedField === "username" ? "opacity-30" : ""}`}
            />
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusedField("username")}
              onBlur={() => setFocusedField(null)}
              placeholder="Foydalanuvchi nomi"
              required
              className="w-full px-6 py-4 bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 
                         text-slate-100 placeholder-slate-500 rounded-2xl
                         focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20
                         transition-all duration-300 outline-none relative z-10
                         font-medium tracking-wide"
            />
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-500 
                            opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        </div>

        {/* Password Field with glow effect */}
        <div className="group">
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-slate-300 mb-3 tracking-wide uppercase text-xs"
          >
            Parol
          </label>
          <div className="relative">
            <div
              className={`absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0 
                            group-hover:opacity-20 transition-opacity duration-500
                            ${focusedField === "password" ? "opacity-30" : ""}`}
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
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
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-cyan-300 
                         transition-colors z-20 hover:scale-110 duration-200"
            >
              {showPassword ? (
                <EyeInvisibleOutlined className="text-xl" />
              ) : (
                <EyeOutlined className="text-xl" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button with animated gradient */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full group overflow-hidden rounded-2xl transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
          >
            {/* Animated gradient background */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 
                            bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]"
            />

            {/* Shimmer effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                            translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"
            />

            {/* Button content */}
            <div className="relative px-6 py-4 font-bold text-lg tracking-wide">
              {isLoading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Tekshirilmoqda...
                </span>
              ) : (
                "Tizimga kirish"
              )}
            </div>
          </button>
        </div>

        {/* Forgot Password Link */}
        <div className="flex items-center justify-end pt-2">
          <Link
            to="/auth/forgot-password"
            className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors
                       relative group inline-block"
          >
            <span className="relative z-10">Parolni unutdingizmi?</span>
            <span
              className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 
                           group-hover:w-full transition-all duration-300"
            />
          </Link>
        </div>
      </form>

      {/* Decorative elements */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
