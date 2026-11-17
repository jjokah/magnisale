import { useEffect, useState } from "react";

// Returns the id of the section crossing the middle of the screen, or null
// when none of them is (at the top of the page, for example). Pass a stable
// array: a new one on every render would restart the observer.
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const inView = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inView.add(entry.target.id);
          else inView.delete(entry.target.id);
        }
        // Page order decides when two sections share the band for a moment.
        setActive(ids.filter((id) => inView.has(id)).at(-1) ?? null);
      },
      // A thin band just above the middle of the viewport.
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const id of ids) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
