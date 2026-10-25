// Magnisale — small progressive enhancements. The site works without this file.

const root = document.documentElement;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Footer year
for (const el of $$("[data-year]")) el.textContent = String(new Date().getFullYear());

// ── Theme (folded corner) ───────────────────────────────────────────────
// Follows the OS setting until the visitor picks one; the head script sets
// the initial value before paint.
const themeToggle = $("[data-theme-toggle]");
const themeColor = $('meta[name="theme-color"]');
const applyTheme = (theme) => {
  root.dataset.theme = theme;
  themeColor?.setAttribute("content", theme === "dark" ? "#0d0d24" : "#0000f2");
  themeToggle?.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
};
applyTheme(root.dataset.theme === "dark" ? "dark" : "light");
themeToggle?.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("theme", next); } catch {}
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch {}
  if (!saved) applyTheme(e.matches ? "dark" : "light");
});

// ── Paper nav: slides in once the blue block has scrolled away ──────────
const paperNav = $("[data-paper-nav]:not(.is-static)");
const blueBlock = $("[data-blue-block]");
if (paperNav && blueBlock) {
  new IntersectionObserver(
    ([entry]) => paperNav.classList.toggle("is-visible", !entry.isIntersecting),
    { rootMargin: "-90px 0px 0px 0px" },
  ).observe(blueBlock);
}

// ── Mobile menu ─────────────────────────────────────────────────────────
const menu = $("#menu");
if (menu) {
  let opener = null;
  const setOpen = (open) => {
    menu.hidden = !open;
    document.body.classList.toggle("no-scroll", open);
    for (const b of $$("[data-menu-open]")) b.setAttribute("aria-expanded", String(open));
    if (open) $("[data-menu-close]", menu)?.focus();
    else opener?.focus();
  };
  for (const b of $$("[data-menu-open]")) {
    b.addEventListener("click", () => { opener = b; setOpen(true); });
  }
  $("[data-menu-close]", menu)?.addEventListener("click", () => setOpen(false));
  for (const a of $$("a", menu)) a.addEventListener("click", () => setOpen(false));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) setOpen(false);
  });
}

// ── Copy to clipboard ───────────────────────────────────────────────────
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = Object.assign(document.createElement("textarea"), { value: text });
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.append(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}
for (const btn of $$("[data-copy]")) {
  const label = btn.dataset.copiedLabel ? btn.textContent : null;
  btn.addEventListener("click", async () => {
    await copyText(btn.dataset.copy);
    btn.dataset.copied = "";
    if (label) btn.textContent = btn.dataset.copiedLabel;
    clearTimeout(btn._t);
    btn._t = setTimeout(() => {
      delete btn.dataset.copied;
      if (label) btn.textContent = label;
    }, 1600);
  });
}

// ── "Reach us directly" tabs ────────────────────────────────────────────
const reach = $("[data-reach]");
if (reach) {
  const tabs = $$('[role="tab"]', reach);
  const panel = $('[role="tabpanel"]', reach);
  const value = $(".reach__value", reach);
  const copy = $(".reach__copy", reach);
  const select = (tab, focus = false) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    }
    panel.setAttribute("aria-labelledby", tab.id);
    value.textContent = tab.dataset.value;
    value.href = tab.dataset.href;
    const external = tab.dataset.href.startsWith("http");
    value.target = external ? "_blank" : "";
    value.rel = external ? "noopener" : "";
    copy.dataset.copy = tab.dataset.value;
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      select(tabs[(i + step + tabs.length) % tabs.length], true);
    });
  });
}

// ── Terminal demo ───────────────────────────────────────────────────────
const termOut = $("[data-term-out]");
if (termOut && !reduceMotion) {
  const SCRIPT = [
    { cmd: "magnisale run lead-pipeline" },
    { text: "→ scanning 1,284 inbound leads", cls: "t-dim", delay: 900 },
    { ok: "312 qualified · 47 high-intent", delay: 1100 },
    { text: "→ drafting personalised outreach", cls: "t-dim", delay: 700 },
    { ok: "47 emails queued for your review", delay: 1300 },
    { text: "→ syncing CRM", cls: "t-dim", delay: 700 },
    { ok: "pipeline complete in 4m 12s", delay: 900 },
  ];
  const span = (cls, text) => Object.assign(document.createElement("span"), { className: cls, textContent: text });
  const prompt = () => termOut.append(span("t-prompt", "~ %"), " ");
  const cursor = span("t-cursor", "");
  let visible = false;
  const whenVisible = async () => { while (!visible) await wait(250); };

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.4 }).observe(termOut);

  (async function loop() {
    for (;;) {
      await whenVisible();
      termOut.replaceChildren();
      prompt();
      termOut.append(cursor);
      await wait(600);
      for (const step of SCRIPT) {
        await whenVisible();
        if (step.cmd) {
          for (const ch of step.cmd) {
            cursor.before(ch);
            await wait(38 + Math.random() * 40);
          }
          await wait(350);
          cursor.before("\n");
          continue;
        }
        await wait(step.delay);
        if (step.ok) cursor.before(span("t-ok", "✓"), ` ${step.ok}\n`);
        else cursor.before(span(step.cls, step.text), "\n");
      }
      cursor.before(span("t-prompt", "~ %"), " ");
      await wait(4500);
    }
  })();
}

// ── Scroll-driven effects: parallax + reveal footer ─────────────────────
const parallax = $$("[data-parallax]");
const revealFooter = $("[data-reveal-footer]");
if (!reduceMotion && (parallax.length || revealFooter)) {
  const desktop = matchMedia("(min-width: 768px)");
  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;
    if (desktop.matches) {
      for (const img of parallax) {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        const k = Number(img.dataset.parallax) || 0.12;
        const py = Math.max(-64, Math.min(64, -(r.top + r.height / 2 - vh / 2) * k));
        img.style.setProperty("--py", `${py.toFixed(1)}px`);
      }
    }
    if (revealFooter) {
      const h = revealFooter.offsetHeight;
      const remaining = root.scrollHeight - (scrollY + vh);
      const p = desktop.matches ? Math.max(0, Math.min(1, 1 - remaining / h)) : 1;
      revealFooter.style.setProperty("--p", p.toFixed(3));
    }
  };
  const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  update();
}

// ── Fade-up on scroll ───────────────────────────────────────────────────
const revealables = $$("[data-reveal]");
if (!reduceMotion && revealables.length && "IntersectionObserver" in window) {
  root.classList.add("reveal-on");
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  for (const el of revealables) io.observe(el);
}
