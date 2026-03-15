"use client";

/**
 * Services
 * 4 service cards in a 2×2 grid.
 * Each card lifts and glows cyan on hover.
 * Cards reveal with a staggered whileInView animation.
 */

import { motion, useReducedMotion } from "motion/react";
import { Bot, BrainCircuit, Workflow, UserCog } from "lucide-react";

/* ─── Service data (from magnisale-services.md) ──────────────────────────── */

const services = [
  {
    icon: Bot,
    title: "AI-Powered Applications",
    description:
      "We build intelligent chatbots and AI-driven apps tailored to your workflows, so your team spends less time on repetitive tasks and more time on work that matters.",
    tag: "Chatbots & Apps",
  },
  {
    icon: BrainCircuit,
    title: "Custom AI Models",
    description:
      "We train and fine-tune models on your specific data, giving you AI that understands your business, not a generic one-size-fits-all solution.",
    tag: "Model Training",
  },
  {
    icon: Workflow,
    title: "AI Automation Workflows",
    description:
      "From lead generation pipelines to real-time news aggregators, we automate the processes that eat into your team's time and drain operational focus.",
    tag: "Automation",
  },
  {
    icon: UserCog,
    title: "Personal AI Agents",
    description:
      "We design autonomous agents that act on your behalf, handling research, scheduling, outreach, and more, so you can focus on decisions that actually move the needle.",
    tag: "AI Agents",
  },
];

/* ─── Animation variants ─────────────────────────────────────────────────── */

const cardVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export default function Services() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="services"
      className="relative py-24 lg:py-32"
      style={{ background: "#080E1F" }}
    >
      {/* Subtle top separator */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24"
        style={{ background: "linear-gradient(to bottom, transparent, #1C2B50)" }}
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center mb-16"
        >
          <p className="section-label mb-4">What We Build</p>
          <h2
            className="text-white"
            style={{
              fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: 1.15,
            }}
          >
            Intelligence built around{" "}
            <span className="text-gradient-light">your business</span>
          </h2>
          <p
            className="mt-4 max-w-xl mx-auto"
            style={{
              fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize: "16px",
              color: "#6B82AD",
              lineHeight: 1.65,
            }}
          >
            Every service we offer is focused on one thing: making your
            operations faster, smarter, and easier to scale.
          </p>
        </motion.div>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;

            return (
              <motion.div
                key={service.title}
                variants={prefersReduced ? {} : cardVariants}
                initial="hidden"
                whileInView="visible"
                transition={{
                  duration: 0.55,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                viewport={{ once: true, margin: "-60px" }}
                data-cursor="hover"
                className="group relative rounded-[20px] p-8 overflow-hidden"
                style={{
                  background: "#0F1A35",
                  border: "1px solid #1C2B50",
                  transition:
                    "transform 300ms cubic-bezier(0.34,1.56,0.64,1), border-color 250ms ease, box-shadow 250ms ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-8px) scale(1.015)";
                  el.style.borderColor = "rgba(0,229,255,0.45)";
                  el.style.boxShadow =
                    "0 16px 48px rgba(10,26,110,0.35), 0 0 30px rgba(0,229,255,0.12)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "";
                  el.style.borderColor = "#1C2B50";
                  el.style.boxShadow = "";
                }}
              >
                {/* Cyan corner glow (reveals on hover via group-hover) */}
                <div
                  className="pointer-events-none absolute top-0 right-0 w-48 h-48 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "radial-gradient(circle at top right, rgba(0,229,255,0.1) 0%, transparent 70%)",
                  }}
                  aria-hidden="true"
                />

                {/* Icon */}
                <div
                  className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-xl"
                  style={{
                    background: "rgba(58,110,255,0.12)",
                    border: "1px solid rgba(58,110,255,0.25)",
                  }}
                >
                  <Icon size={22} color="#5B8FFF" strokeWidth={1.75} />
                </div>

                {/* Tag */}
                <p className="section-label mb-3">{service.tag}</p>

                {/* Title */}
                <h3
                  className="text-white mb-3"
                  style={{
                    fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                    fontWeight: 600,
                    fontSize: "19px",
                    lineHeight: 1.3,
                  }}
                >
                  {service.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                    fontSize: "15px",
                    color: "#6B82AD",
                    lineHeight: 1.7,
                  }}
                >
                  {service.description}
                </p>

                {/* Hover arrow indicator */}
                <div
                  className="mt-6 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ color: "#00E5FF" }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                      fontSize: "12px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                    }}
                  >
                    LEARN MORE
                  </span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7h10M8 3l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
