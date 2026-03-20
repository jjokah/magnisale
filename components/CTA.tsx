"use client";

/**
 * CTA
 * Full-width conversion section with gradient background,
 * radial cyan glow, and an inline contact form.
 */

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Send } from "lucide-react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "12px",
  padding: "14px 18px",
  color: "#E8EDF8",
  fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
  fontSize: "15px",
  outline: "none",
  transition: "border-color 200ms ease, box-shadow 200ms ease",
};

export default function CTA() {
  const prefersReduced = useReducedMotion();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(0,229,255,0.5)";
    e.target.style.boxShadow = "0 0 0 3px rgba(0,229,255,0.08)";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = "rgba(255,255,255,0.15)";
    e.target.style.boxShadow = "none";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

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
          pressure. Just a straight conversation about what&apos;s possible.
        </motion.p>

        {/* Contact form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={prefersReduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true }}
          className="w-full max-w-lg mx-auto flex flex-col gap-4 text-left"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              name="name"
              placeholder="Your name"
              required
              value={form.name}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={inputStyle}
            />
            <input
              type="email"
              name="email"
              placeholder="Your email"
              required
              value={form.email}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={inputStyle}
            />
          </div>

          <textarea
            name="message"
            placeholder="Tell us about your project…"
            required
            rows={4}
            value={form.message}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{ ...inputStyle, resize: "none" }}
          />

          {status === "success" ? (
            <p style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)", fontSize: "15px", color: "#00E5FF", textAlign: "center" }}>
              Message sent — we&apos;ll be in touch shortly.
            </p>
          ) : (
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-accent"
              data-cursor="hover"
              style={{ alignSelf: "center", opacity: status === "loading" ? 0.7 : 1 }}
            >
              <Send size={16} />
              {status === "loading" ? "Sending…" : "Send Message"}
            </button>
          )}

          {status === "error" && (
            <p style={{ fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)", fontSize: "13px", color: "rgba(255,100,100,0.8)", textAlign: "center" }}>
              Something went wrong. Please try again.
            </p>
          )}
        </motion.form>

        {/* Fine-print trust line */}
        <motion.p
          initial={prefersReduced ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-6"
          style={{
            fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
            fontSize: "13px",
            color: "rgba(196,205,224,0.45)",
          }}
        >
          No commitment · Response within 24 hours
        </motion.p>
      </div>
    </section>
  );
}
