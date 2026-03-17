import { Link } from "react-router-dom";
import { Button, Result } from "antd";
import { useEffect, useState } from "react";

const NotFoundPage = () => {
  const [dots, setDots] = useState<{ x: number; y: number; opacity: number }[]>(
    [],
  );

  useEffect(() => {
    const generated = Array.from({ length: 18 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      opacity: 0.08 + Math.random() * 0.12,
    }));
    setDots(generated);
  }, []);

  return (
    <div
      className="rounded-xl"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4f8 0%, #e2eaf2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Sora', 'Segoe UI', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative floating circles */}
      {dots.map((dot, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: i % 3 === 0 ? 80 : i % 3 === 1 ? 40 : 20,
            height: i % 3 === 0 ? 80 : i % 3 === 1 ? 40 : 20,
            borderRadius: "50%",
            background: i % 2 === 0 ? "#00c6ff" : "#1e293b",
            opacity: dot.opacity,
            filter: "blur(2px)",
            animation: `float${i % 3} ${4 + (i % 4)}s ease-in-out infinite alternate`,
            pointerEvents: "none",
          }}
        />
      ))}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;800&display=swap');

        @keyframes float0 { from { transform: translateY(0px); } to { transform: translateY(-18px); } }
        @keyframes float1 { from { transform: translateY(0px) rotate(0deg); } to { transform: translateY(-12px) rotate(8deg); } }
        @keyframes float2 { from { transform: translateY(0px); } to { transform: translateY(-24px); } }

        @keyframes glowPulse {
          0%, 100% { text-shadow: 0 0 20px rgba(0,198,255,0.5), 0 0 40px rgba(0,198,255,0.2); }
          50% { text-shadow: 0 0 40px rgba(0,198,255,0.9), 0 0 80px rgba(0,198,255,0.4); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .not-found-card {
          animation: slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .four04-text {
          animation: glowPulse 2.5s ease-in-out infinite;
        }

        .home-btn:hover {
          background: #00d4ff !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(0,198,255,0.45) !important;
        }

        .home-btn {
          transition: all 0.25s ease !important;
        }
      `}</style>

      {/* Main card */}
      <div
        className="not-found-card"
        style={{
          background: "rgba(30, 41, 59, 0.92)",
          backdropFilter: "blur(16px)",
          borderRadius: 24,
          padding: "56px 64px",
          maxWidth: 460,
          width: "90%",
          textAlign: "center",
          boxShadow:
            "0 32px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.06)",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 80,
            height: 4,
            background: "linear-gradient(90deg, #00c6ff, #0072ff)",
            borderRadius: "0 0 4px 4px",
          }}
        />

        {/* 404 */}
        <div
          className="four04-text"
          style={{
            fontSize: 100,
            fontWeight: 800,
            lineHeight: 1,
            background: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-4px",
            marginBottom: 8,
          }}
        >
          404
        </div>

        {/* Divider */}
        <div
          style={{
            width: 40,
            height: 2,
            background: "rgba(0,198,255,0.4)",
            margin: "16px auto 20px",
            borderRadius: 2,
          }}
        />

        <h2
          style={{
            color: "#f1f5f9",
            fontSize: 22,
            fontWeight: 700,
            margin: "0 0 12px",
            letterSpacing: "-0.3px",
          }}
        >
          Sahifa topilmadi!
        </h2>

        <p
          style={{
            color: "#94a3b8",
            fontSize: 14,
            lineHeight: 1.7,
            margin: "0 0 36px",
          }}
        >
          Siz qidirayotgan sahifa mavjud emas yoki ko'chirib o'tkazilgan.
        </p>

        <Link to="/">
          <Button
            className="home-btn"
            style={{
              background: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
              border: "none",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              height: 46,
              paddingInline: 36,
              borderRadius: 12,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0,198,255,0.3)",
              letterSpacing: "0.2px",
            }}
          >
            Bosh sahifaga qaytish
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
