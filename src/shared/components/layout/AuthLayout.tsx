// src/shared/components/layout/AuthLayout.jsx
"use client";

import { Outlet } from "react-router-dom";
import { motion } from "motion/react";
import { LampContainer } from "@/components/ui/lamp";

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-slate-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-20" />
      </div>

      {/* LEFT — Enhanced Lamp / Branding (desktop only) */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <LampContainer>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center px-8"
          >
            {/* Logo/Icon placeholder - you can replace with actual logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8 inline-block"
            >
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 
                            flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.5)]
                            relative overflow-hidden group">
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                              -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {/* Icon */}
                <svg className="w-10 h-10 text-white relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4
                          text-transparent bg-clip-text
                          bg-gradient-to-br from-slate-100 via-slate-200 to-slate-400
                          drop-shadow-[0_0_30px_rgba(148,163,184,0.3)]">
              Loyiha Monitoring
            </h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="h-1 w-32 mx-auto mb-6 bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full"
            />

            <p className="text-base md:text-lg text-slate-300/90 font-light tracking-wide max-w-md mx-auto leading-relaxed">
              Loyihalarni real vaqt rejimida boshqarish va nazorat qilish tizimi
            </p>

            {/* Feature highlights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto"
            >
              {[
                { icon: "⚡", label: "Tezkor" },
                { icon: "🔒", label: "Xavfsiz" },
                { icon: "📊", label: "Samarali" }
              ].map((feature, index) => (
                <div key={index} 
                     className="text-center group cursor-default"
                     style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="text-3xl mb-2 group-hover:scale-125 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <div className="text-xs text-slate-400 font-medium tracking-wider uppercase">
                    {feature.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </LampContainer>
      </div>

      {/* RIGHT — Auth Forms with enhanced styling */}
      <div className="w-full lg:w-1/2 flex flex-col bg-slate-950/95 backdrop-blur-xl relative">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-transparent to-slate-900/50 pointer-events-none" />
        
        <div className="flex flex-1 items-center justify-center px-6 sm:px-12 relative z-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden mt-10 mb-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 
                            flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.4)]">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Loyiha Monitoring
              </h1>
            </div>

            <Outlet />
          </div>
        </div>

        <footer className="border-t border-slate-800/50 py-6 text-center relative z-10 backdrop-blur-sm bg-slate-950/30">
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            © 2026 Ko'prikQurilish AJ
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Barcha huquqlar himoyalangan
          </p>
        </footer>
      </div>
    </div>
  );
}