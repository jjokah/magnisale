import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@magnisale/ui";
import { cta, footer, whatsappHref } from "../../content/site";

// On phones the hero's buttons scroll away quickly, so a bar at the bottom
// keeps the call to action in reach. It stays out of the way while the hero
// (or a blog page's header), the contact section, a post's closing call to
// action or the footer is on screen.
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
    for (const selector of ["#top", "#contact", "#post-cta", "footer"]) {
      const element = document.querySelector(selector);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      inert={!show}
      className={`fixed inset-x-0 bottom-0 z-10 flex gap-3 border-t border-line bg-surface/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md transition-transform duration-220 ease-standard motion-reduce:transition-none md:hidden ${
        show ? "" : "translate-y-full"
      }`}
    >
      {/* Both buttons fit a 320 px screen: the short label, tighter padding,
          and the call to action takes whatever width is left. */}
      {whatsappHref && (
        <Button href={whatsappHref} variant="secondary" target="_blank" rel="noopener noreferrer" className="flex-none px-4">
          <MessageCircle size={20} strokeWidth={1.75} aria-hidden="true" />
          {footer.whatsapp}
        </Button>
      )}
      <Button href={cta.href} className="min-w-0 flex-1 px-4">
        {cta.short}
      </Button>
    </div>
  );
}
