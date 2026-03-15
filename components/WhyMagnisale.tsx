"use client";

/**
 * WhyMagnisale
 * Trust / differentiator section with 3 feature cards and a side-by-side
 * layout (feature list + decorative right panel on desktop).
 */

import { motion, useReducedMotion } from "motion/react";
import { Zap, Target, HeartHandshake } from "lucide-react";

const pillars = [
  {
    icon: Zap,
    title: "Rapid Deployment",
    body: "From brief to working AI in weeks, not months. We move with urgency because your business can't afford to wait for results.",
    metric: "Weeks",
    metricLabel: "Not months",
  },
  {
    icon: Target,
    title: "Business-First Thinking",
    body: "We understand your goals before writing a single line of code. Every decision is driven by what creates real value for your operations.",
    metric: "0",
    metricLabel: "Assumptions made",
  },
  {
    icon: HeartHandshake,
    title: "Ongoing Support",
    body: "We stay on after launch to monitor, improve, and scale with you. Your AI should get better over time, not drift and degrade.",
    metric: "Always",
    metricLabel: "Here after launch",
  },
];

export default function WhyMagnisale() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="why-magnisale"
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ background: "#0F1A35" }}
    >
      {/* Background decorative grid */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(rgba(44,64,112,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(44,64,112,0.2) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="max-w-2xl mb-16"
        >
          <p className="section-label mb-4">Why Magnisale</p>
          <h2
            className="text-white mb-5"
            style={{
              fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: 1.15,
            }}
          >
            Built for businesses that{" "}
            <span className="text-gradient-light">can&apos;t afford to fall behind</span>
          </h2>
          <p
            style={{
              fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize: "16px",
              color: "#6B82AD",
              lineHeight: 1.65,
            }}
          >
            Working with Magnisale means you get more than a vendor. You get a
            team that&apos;s as invested in your outcomes as you are.
          </p>
        </motion.div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, i) => {
            const Icon = pillar.icon;

            return (
              <motion.div
                key={pillar.title}
                initial={prefersReduced ? false : { opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  delay: i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                viewport={{ once: true, margin: "-60px" }}
                data-cursor="hover"
                className="relative rounded-[20px] overflow-hidden"
                style={{
                  background: "#080E1F",
                  border: "1px solid #1C2B50",
                  padding: "0",
                }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute top-0 left-0 w-[3px] h-full"
                  style={{ background: "var(--grad-primary)" }}
                  aria-hidden="true"
                />

                <div className="pl-8 pr-6 py-8">
                  {/* Metric */}
                  <div className="mb-6">
                    <p
                      className="text-gradient-light"
                      style={{
                        fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                        fontWeight: 800,
                        fontSize: "36px",
                        lineHeight: 1,
                      }}
                    >
                      {pillar.metric}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                        fontSize: "12px",
                        color: "#6B82AD",
                        marginTop: "4px",
                      }}
                    >
                      {pillar.metricLabel}
                    </p>
                  </div>

                  {/* Icon + title */}
                  <div className="flex items-start gap-3 mb-3">
                    <div
                      className="shrink-0 mt-0.5 inline-flex items-center justify-center w-9 h-9 rounded-lg"
                      style={{
                        background: "rgba(58,110,255,0.1)",
                        border: "1px solid rgba(58,110,255,0.2)",
                      }}
                    >
                      <Icon size={18} color="#5B8FFF" strokeWidth={1.75} />
                    </div>
                    <h3
                      className="text-white"
                      style={{
                        fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                        fontWeight: 600,
                        fontSize: "17px",
                        lineHeight: 1.3,
                      }}
                    >
                      {pillar.title}
                    </h3>
                  </div>

                  {/* Body */}
                  <p
                    style={{
                      fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                      fontSize: "14px",
                      color: "#6B82AD",
                      lineHeight: 1.7,
                    }}
                  >
                    {pillar.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom quote / trust signal */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-40px" }}
          className="mt-16 flex items-center justify-center"
        >
          <div
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full"
            style={{
              background: "rgba(0,229,255,0.06)",
              border: "1px solid rgba(0,229,255,0.2)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full bg-[#00E5FF]"
              style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
            />
            <p
              style={{
                fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                fontSize: "14px",
                color: "#C4CDE0",
              }}
            >
              Every project starts with a free discovery call,{" "}
              <span style={{ color: "#00E5FF" }}>no commitment required</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
