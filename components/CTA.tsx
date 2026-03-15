"use client";

/**
 * CTA
 * Full-width conversion section with gradient background,
 * radial cyan glow, and two action buttons.
 */

import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, MessageSquare } from "lucide-react";

export default function CTA() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="contact"
      className="relative py-24 lg:py-36 overflow-hidden"
      style={{ background: "var(--grad-primary)" }}
    >
      {/* Cyan glow — top-right accent */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(0,229,255,0.2) 0%, transparent 65%)",
        }}
      />

      {/* Bottom-left counter-glow for depth */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(circle at bottom left, rgba(10,26,110,0.6) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">

        {/* Label */}
        <motion.p
          className="section-label mb-5"
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
        >
          Start a Project
        </motion.p>

        {/* Headline */}
        <motion.h2
          className="text-white"
          initial={prefersReduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          style={{
            fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
            fontWeight: 800,
            fontSize: "clamp(32px, 5vw, 56px)",
            lineHeight: 1.1,
          }}
        >
          Ready to build smarter?
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="mt-4 mb-10 max-w-lg mx-auto"
          style={{
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize: "17px",
            color: "rgba(196,205,224,0.8)",
            lineHeight: 1.65,
          }}
        >
          Let&apos;s talk about what AI can do for your business. No jargon, no
          pressure — just a straight conversation about what&apos;s possible.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="mailto:hello@magnisale.com"
            className="btn-accent"
            data-cursor="hover"
          >
            <MessageSquare size={18} />
            Start a Conversation
          </a>

          <a
            href="#services"
            className="btn-ghost"
            data-cursor="hover"
            style={{
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#E8EDF8",
            }}
          >
            Explore Services
            <ArrowRight size={16} />
          </a>
        </motion.div>

        {/* Fine-print trust line */}
        <motion.p
          initial={prefersReduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-8"
          style={{
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize: "13px",
            color: "rgba(196,205,224,0.45)",
          }}
        >
          Free discovery call · No commitment · Response within 24 hours
        </motion.p>
      </div>
    </section>
  );
}
