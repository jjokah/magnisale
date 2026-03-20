"use client";

/**
 * Navbar
 * Floating glassmorphism navbar that:
 * - Hides when scrolling down, reappears when scrolling up
 * - Has a subtle blur + border on scroll
 * - Mobile: hamburger toggles a slide-down menu
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Blog", href: "/blog" },
];

export default function Navbar() {
  const [hidden,     setHidden]     = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const lastScrollY  = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      setScrolled(y > 20);

      // Hide on scroll down (past 80px), show on scroll up
      if (y > 80) {
        setHidden(y > lastScrollY.current);
      } else {
        setHidden(false);
      }

      lastScrollY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: 0 }}
      animate={{ y: hidden ? "-110%" : "0%" }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-[999]"
    >
      <div
        className="mx-auto transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(8, 14, 31, 0.75)"
            : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          borderBottom: scrolled
            ? "1px solid rgba(28, 43, 80, 0.8)"
            : "1px solid transparent",
        }}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-3 items-center h-[68px]">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0"
            data-cursor="hover"
          >
            <Image
              src="/magnisale-logo-icon.png"
              alt="Magnisale"
              width={32}
              height={32}
              className="w-8 h-8"
              priority
            />
            <span
              className="text-white text-[15px] tracking-[0.08em] uppercase"
              style={{ fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)", fontWeight: 700 }}
            >
              Magnisale
            </span>
          </Link>

          {/* Desktop nav links */}
          <ul className="hidden md:flex items-center justify-center gap-8 justify-self-center">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  data-cursor="hover"
                  className="text-[13px] font-medium transition-colors duration-200"
                  style={{
                    fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                    color: "#6B82AD",
                  }}
                  onMouseEnter={(e) =>
                    ((e.target as HTMLElement).style.color = "#C4CDE0")
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.color = "#6B82AD")
                  }
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:flex justify-end">
            <a
              href="#contact"
              data-cursor="hover"
              className="btn-primary"
              style={{ padding: "10px 22px", fontSize: "13px" }}
            >
              Get Started
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden col-start-3 justify-self-end p-2 rounded-lg text-[#6B82AD] hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            data-cursor="hover"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              style={{
                background: "rgba(8, 14, 31, 0.95)",
                backdropFilter: "blur(20px)",
                borderTop: "1px solid rgba(28, 43, 80, 0.6)",
                overflow: "hidden",
              }}
            >
              <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-4 items-center">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-[15px] py-2 border-b border-[#1C2B50] transition-colors w-full text-center"
                    style={{
                      fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
                      color: "#C4CDE0",
                    }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="#contact"
                  className="btn-primary mt-2"
                  style={{ padding: "10px 22px", fontSize: "13px" }}
                  onClick={() => setMenuOpen(false)}
                >
                  Get Started
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
