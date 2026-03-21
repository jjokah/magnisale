"use client";

/**
 * Footer
 * Clean dark footer with logo, tagline, nav links, and social icons.
 */

import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        background: "#080E1F",
        borderTop: "1px solid #1C2B50",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">

        {/* Top row */}
        <div className="flex flex-col md:grid md:grid-cols-3 items-start md:items-center gap-8 mb-10">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="flex items-center gap-3"
              data-cursor="hover"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <Image
                src="/magnisale-logo-icon.png"
                alt="Magnisale"
                width={28}
                height={28}
                className="w-7 h-7"
              />
              <span
                className="text-white text-[14px] tracking-[0.08em] uppercase"
                style={{
                  fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
                  fontWeight: 700,
                }}
              >
                Magnisale
              </span>
            </Link>
          </div>

          {/* Tagline */}
          <p
            className="justify-self-center text-center"
            style={{
              fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize: "13px",
              color: "#6B82AD",
              lineHeight: 1.6,
            }}
          >
            Intelligent systems for modern business.
          </p>

          {/* Social icons */}
          <div className="flex items-center gap-4 md:justify-self-end">
            {/* Blog */}
            <a
              href="/blog"
              data-cursor="hover"
              aria-label="Read the Magnisale blog"
              className="transition-colors duration-150"
              style={{ color: "#2E4070" }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "#5B8FFF")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "#2E4070")
              }
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 14H7v-2h5v2zm5-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="https://x.com/magnisale"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              aria-label="Follow Magnisale on X"
              className="transition-colors duration-150"
              style={{ color: "#2E4070" }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "#5B8FFF")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "#2E4070")
              }
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63Zm-1.161 17.52h1.833L7.084 4.126H5.117Z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com/company/magnisale"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              aria-label="Connect with Magnisale on LinkedIn"
              className="transition-colors duration-150"
              style={{ color: "#2E4070" }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.color = "#5B8FFF")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.color = "#2E4070")
              }
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{ height: "1px", background: "#1C2B50", marginBottom: "24px" }}
        />

        {/* Bottom row */}
        <div className="flex justify-center">
          <p
            style={{
              fontFamily: "var(--font-dm-sans, 'DM Sans', sans-serif)",
              fontSize: "12px",
              color: "#2E4070",
            }}
          >
            © {year} Magnisale. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
