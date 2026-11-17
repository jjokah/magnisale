import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "../components/Button";
import { cta, footer, whatsappHref } from "../content";

// On phones the hero's buttons scroll away quickly, so a bar at the bottom
// keeps the call to action in reach. It stays out of the way while the hero,
// the contact section or the footer is on screen.
export function MobileCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScreen = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      setShow(onScreen.size === 0);
    });
    for (const selector of ["#top", "#contact", "footer"]) {
      const element = document.querySelector(selector);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-10 flex gap-3 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-220 ease-standard md:hidden ${
        show ? "" : "translate-y-full"
      }`}
    >
      {whatsappHref && (
        <Button href={whatsappHref} variant="secondary" target="_blank" rel="noopener noreferrer" className="flex-1">
          <MessageCircle size={20} strokeWidth={1.75} aria-hidden="true" />
          {footer.whatsapp}
        </Button>
      )}
      <Button href={cta.href} className="flex-1">
        {cta.label}
      </Button>
    </div>
  );
}
