import type { Metadata } from "next";
import { Exo_2, DM_Sans } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import CustomCursor from "@/components/CustomCursor";

/* ─── Fonts ──────────────────────────────────────────────────────────────── */

const exo2 = Exo_2({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-exo2",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

/* ─── Metadata ───────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  metadataBase: new URL("https://magnisale.com"),
  title: "Magnisale | AI-Powered Business Systems",
  description:
    "Magnisale builds intelligent AI systems for modern businesses: from chatbots and custom models to automation workflows and personal AI agents.",
  keywords: ["AI", "automation", "chatbot", "machine learning", "business AI", "Magnisale"],
  openGraph: {
    title: "Magnisale | AI-Powered Business Systems",
    description:
      "Intelligent systems built for businesses that move fast. Chatbots, custom AI models, automation workflows, and personal agents.",
    type: "website",
    images: [{ url: "/magnisale-logo-icon.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Magnisale | AI-Powered Business Systems",
    description: "Intelligent systems built for businesses that move fast.",
  },
};

/* ─── Layout ─────────────────────────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${exo2.variable} ${dmSans.variable}`}>
      <body>
        {/* Lenis smooth scroll wrapper */}
        <SmoothScrollProvider>
          {/* Custom cursor (desktop only — hidden on touch) */}
          <CustomCursor />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
