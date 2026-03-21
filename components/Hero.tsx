"use client";

/**
 * Hero
 * - Animated gradient mesh background (CSS @keyframes, no canvas)
 * - Staggered entrance: badge → headline line 1 → line 2 → subtext → CTAs
 * - Magnetic CTA button (slight translate on mousemove inside its area)
 * - Scroll indicator chevron at bottom
 */

import { useRef, useCallback } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronDown } from "lucide-react";

/* ─── Animation variants ─────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.1,
    },
  },
};

export default function Hero() {
  const prefersReduced = useReducedMotion();

  // Magnetic CTA ref
  const ctaRef = useRef<HTMLAnchorElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (prefersReduced || !ctaRef.current) return;
      const rect = ctaRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * 0.35;
      const dy = (e.clientY - cy) * 0.35;
      ctaRef.current.style.transform = `translate(${dx}px, ${dy}px) translateY(-2px)`;
    },
    [prefersReduced]
  );

  const handleMouseLeave = useCallback(() => {
    if (!ctaRef.current) return;
    ctaRef.current.style.transform = "";
    ctaRef.current.style.transition =
      "transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms ease";
  }, []);

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden pt-20"
      style={{ minHeight: "100svh" }}
    >
      {/* ── Gradient mesh background ───────────────────────────────────── */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{ background: "#080E1F" }}
      >
        {/* Orb 1 — large primary blue, top-right */}
        <div
          style={{
            position: "absolute",
            top: "-10%",
            right: "-5%",
            width: "65vw",
            height: "65vw",
            maxWidth: 900,
            maxHeight: 900,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(26,58,245,0.28) 0%, transparent 70%)",
            animation: "mesh-drift-1 14s ease-in-out infinite",
          }}
        />

        {/* Orb 2 — accent cyan, bottom-left */}
        <div
          style={{
            position: "absolute",
            bottom: "5%",
            left: "-10%",
            width: "50vw",
            height: "50vw",
            maxWidth: 700,
            maxHeight: 700,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,229,255,0.1) 0%, transparent 65%)",
            animation: "mesh-drift-2 18s ease-in-out infinite",
          }}
        />

        {/* Orb 3 — mid blue, centre */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "30%",
            width: "40vw",
            height: "40vw",
            maxWidth: 560,
            maxHeight: 560,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(58,110,255,0.14) 0%, transparent 70%)",
            animation: "mesh-drift-3 22s ease-in-out infinite",
          }}
        />

        {/* Fine horizontal grid lines for depth */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(28,43,80,0.3) 1px, transparent 1px)",
            backgroundSize: "100% 80px",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)",
          }}
        />
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          variants={prefersReduced ? {} : fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 mb-7"
        >
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.1em]"
            style={{
              background: "rgba(0,229,255,0.08)",
              border: "1px solid rgba(0,229,255,0.25)",
              color: "#00E5FF",
              fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
            }}
          >
            {/* Pulse dot */}
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]"
              style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
            />
            AI-Powered Business Systems
          </span>
        </motion.div>

        {/* Headline */}
        <div className="mb-6 overflow-hidden">
          <motion.h1
            variants={prefersReduced ? {} : fadeUp}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-white leading-[1.08] tracking-tight"
            style={{
              fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
              fontWeight: 800,
              fontSize: "clamp(42px, 7vw, 80px)",
            }}
          >
            AI That Works
          </motion.h1>
          <motion.h1
            variants={prefersReduced ? {} : fadeUp}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="leading-[1.08] tracking-tight"
            style={{
              fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
              fontWeight: 800,
              fontSize: "clamp(42px, 7vw, 80px)",
              background: "var(--grad-light)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            While You Focus
          </motion.h1>
        </div>

        {/* Subheading */}
        <motion.p
          variants={prefersReduced ? {} : fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize: "clamp(16px, 2vw, 19px)",
            color: "#6B82AD",
          }}
        >
          Magnisale builds intelligent systems, from chatbots to autonomous
          agents, so your business can{" "}
          <span style={{ color: "#C4CDE0" }}>move faster and smarter</span>.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={prefersReduced ? {} : fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* Magnetic primary CTA */}
          <a
            ref={ctaRef}
            href="#services"
            className="btn-primary"
            data-cursor="hover"
            style={{
              padding: "14px 32px",
              fontSize: "15px",
              transition:
                "box-shadow 300ms ease",
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            Explore Services
            <ArrowRight size={16} />
          </a>

          <a
            href="#why-magnisale"
            className="btn-secondary"
            data-cursor="hover"
            style={{ padding: "14px 32px", fontSize: "15px" }}
          >
            See How It Works
          </a>
        </motion.div>

        {/* Stat strip */}
        <motion.div
          variants={prefersReduced ? {} : fadeUp}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 hidden sm:flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12"
        >
          {[
            { value: "4+", label: "AI Service Lines" },
            { value: "Fast", label: "From Brief to Live" },
            { value: "Real", label: "Business Outcomes" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span
                className="text-gradient-light"
                style={{
                  fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                  fontWeight: 800,
                  fontSize: "28px",
                }}
              >
                {stat.value}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                  fontSize: "12px",
                  color: "#6B82AD",
                  letterSpacing: "0.04em",
                }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ──────────────────────────────────────────── */}
      <div
        className="hidden 2xl:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 opacity-40"
        style={{ animation: "bounce-y 2s ease-in-out infinite" }}
        aria-hidden="true"
      >
        <span
          className="text-[10px] uppercase tracking-[0.12em]"
          style={{
            fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
            color: "#6B82AD",
          }}
        >
          Scroll
        </span>
        <ChevronDown size={16} color="#6B82AD" />
      </div>
    </section>
  );
}
