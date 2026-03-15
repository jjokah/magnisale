"use client";

/**
 * CustomCursor
 * A two-part cursor: a small dot that follows the mouse precisely,
 * and a larger ring with a spring-lag effect.
 *
 * - Desktop only: hidden on touch/pointer-coarse devices
 * - Expands on hover over [data-cursor="hover"] elements
 * - Hides native cursor via <style> injection (cleaned up on unmount)
 */

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "motion/react";

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Raw mouse position (dot follows this exactly)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Spring-lagged position for the ring
  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
  const ringX = useSpring(mouseX, springConfig);
  const ringY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Only render on devices that support hover + fine pointer (mouse)
    const isPointerFine = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    ).matches;

    if (!isPointerFine) return;

    setVisible(true);

    // Inject style to hide the native cursor globally
    const style = document.createElement("style");
    style.id = "hide-cursor";
    style.textContent = "*, *::before, *::after { cursor: none !important; }";
    document.head.appendChild(style);

    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    // Expand ring when hovering interactive elements
    const onEnter = (e: MouseEvent) => {
      const target = e.target as Element;
      if (
        target.closest('[data-cursor="hover"]') ||
        target.closest("a") ||
        target.closest("button")
      ) {
        setExpanded(true);
      }
    };

    const onLeave = (e: MouseEvent) => {
      const target = e.target as Element;
      if (
        target.closest('[data-cursor="hover"]') ||
        target.closest("a") ||
        target.closest("button")
      ) {
        setExpanded(false);
      }
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
      document.getElementById("hide-cursor")?.remove();
    };
  }, [mouseX, mouseY]);

  if (!visible) return null;

  return (
    <>
      {/* Dot — snaps to mouse instantly */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999]"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: "#00E5FF",
        }}
      />

      {/* Ring — lags behind with spring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[9999] rounded-full border"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width:  expanded ? 56 : 36,
          height: expanded ? 56 : 36,
          borderColor: expanded ? "#00E5FF" : "rgba(91,143,255,0.6)",
          backgroundColor: expanded
            ? "rgba(0,229,255,0.06)"
            : "transparent",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      />
    </>
  );
}
