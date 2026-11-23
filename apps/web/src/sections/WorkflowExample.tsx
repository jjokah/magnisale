import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Pause, Play } from "lucide-react";
import { IconTile } from "../components/IconTile";
import { StatusBadge, type BadgeStatus } from "../components/StatusBadge";
import { workflows, workflowUi } from "../content";

const STEP_MS = 1100;
const HOLD_MS = 3600;
// A phase past every step: the whole workflow shown finished.
const FINISHED = Number.POSITIVE_INFINITY;

type Step = (typeof workflows)[number]["steps"][number];

// What a step shows while the example plays. Steps before `phase` have
// finished, the step at `phase` is being worked on, later ones are queued.
// The first step is the trigger and a "Needs review" step waits for a person,
// so neither is ever shown as "Working".
function shown(step: Step, index: number, phase: number): { state: string; status: BadgeStatus; label: string } {
  if (index === 0 || index < phase || (index === phase && step.status !== "success")) {
    return { state: "final", status: step.status, label: step.statusLabel };
  }
  if (index === phase) return { state: "working", status: "working", label: workflowUi.working };
  return { state: "queued", status: "neutral", label: workflowUi.queued };
}

const rowStates: Record<string, string> = {
  final: "border-line",
  working: "border-blue-300 shadow-md",
  queued: "border-line opacity-50",
};

// The hero's picture: real-looking workflows instead of an illustration. The
// prerendered page shows the first one finished. In the browser it plays
// through each step, then moves on to the next example until a visitor picks
// a tab. The pause button stops it. With reduced motion it stays finished and
// never plays.
export function WorkflowExample() {
  const id = useId();
  const figure = useRef<HTMLElement>(null);
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const started = useRef(false);

  const [tab, setTab] = useState(0);
  const [phase, setPhase] = useState(FINISHED);
  const [rotating, setRotating] = useState(true);
  const [paused, setPaused] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const [visible, setVisible] = useState(false);
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setMotion(!reduced.matches);
    onChange();
    reduced.addEventListener("change", onChange);

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 });
    if (figure.current) observer.observe(figure.current);

    return () => {
      reduced.removeEventListener("change", onChange);
      observer.disconnect();
    };
  }, []);

  // The first time the example is on screen, carry on from what the
  // prerendered page already shows (this example, finished) rather than
  // jumping back to its first step: hold it, then move on to the next one.
  useEffect(() => {
    if (!motion) {
      setPhase(FINISHED);
    } else if (visible && !started.current) {
      started.current = true;
      setPhase(workflows[tab].steps.length);
    }
  }, [motion, visible]);

  const finished = phase >= workflows[tab].steps.length;
  const playing = motion && visible && !paused && phase !== FINISHED;

  // Steps always play through. Moving on to the next example waits while the
  // pointer or keyboard focus is on the figure, so it never changes under a
  // visitor who is reading or using it.
  useEffect(() => {
    if (!playing || (finished && (!rotating || engaged))) return;
    const timer = setTimeout(
      () => {
        if (!finished) {
          setPhase(phase + 1);
        } else {
          setTab((tab + 1) % workflows.length);
          setPhase(1);
        }
      },
      finished ? HOLD_MS : STEP_MS,
    );
    return () => clearTimeout(timer);
  }, [playing, finished, rotating, engaged, phase, tab]);

  const select = (index: number) => {
    // A picked tab plays from its first step, even if the figure has not
    // counted as on screen yet.
    started.current = true;
    setRotating(false);
    setTab(index);
    setPhase(motion ? 1 : FINISHED);
  };

  const onTabKey = (event: KeyboardEvent) => {
    const last = workflows.length - 1;
    const next =
      event.key === "ArrowRight"
        ? (tab + 1) % workflows.length
        : event.key === "ArrowLeft"
          ? (tab + last) % workflows.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    select(next);
    tabButtons.current[next]?.focus();
  };

  return (
    <figure
      ref={figure}
      onPointerEnter={() => setEngaged(true)}
      onPointerLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
      className="reveal overflow-hidden rounded-xl border border-line bg-surface shadow-glow"
      style={{ "--i": 2 } as CSSProperties}
    >
      <figcaption className="sr-only">{workflowUi.caption}</figcaption>

      {/* Tighter on phones so the pause button stays on the row; on the
          narrowest screens it wraps below rather than being clipped. */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-3 sm:gap-3 sm:px-5">
        <div
          role="tablist"
          aria-label={workflowUi.tabs}
          onKeyDown={onTabKey}
          className="flex rounded-pill bg-ink-100 p-1"
        >
          {workflows.map((flow, index) => (
            <button
              key={flow.tab}
              ref={(element) => {
                tabButtons.current[index] = element;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={index === tab}
              aria-controls={`${id}-panel-${index}`}
              tabIndex={index === tab ? 0 : -1}
              onClick={() => select(index)}
              className="h-10 rounded-pill px-2.5 text-small font-semibold text-ink-600 transition-[color,background-color,box-shadow] duration-220 ease-standard hover:text-fg aria-selected:bg-surface aria-selected:text-fg aria-selected:shadow-sm sm:px-4"
            >
              {flow.tab}
            </button>
          ))}
        </div>

        {motion && (
          <button
            type="button"
            aria-label={paused ? workflowUi.play : workflowUi.pause}
            onClick={() => setPaused(!paused)}
            className="ml-auto flex size-11 flex-none items-center justify-center rounded-pill text-ink-500 transition-[color,background-color] duration-140 ease-standard hover:bg-ink-100 hover:text-fg"
          >
            {paused ? (
              <Play size={18} strokeWidth={1.75} aria-hidden="true" />
            ) : (
              <Pause size={18} strokeWidth={1.75} aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {/* Every panel sits in the same grid cell, so the figure keeps the height
          of the tallest one and nothing below it moves when the tab changes. */}
      <div className="grid bg-surface-subtle">
        {workflows.map((flow, index) => {
          const current = index === tab;
          return (
            <div
              key={flow.tab}
              role="tabpanel"
              id={`${id}-panel-${index}`}
              aria-labelledby={`${id}-tab-${index}`}
              inert={!current}
              className={`col-start-1 row-start-1 p-4 sm:p-5 ${current ? "" : "invisible"}`}
            >
              <p className="t-eyebrow mb-4 text-fg-muted">{flow.label}</p>
              <ol className="flex flex-col">
                {flow.steps.map((step, stepIndex) => {
                  const now = shown(step, stepIndex, current ? phase : FINISHED);
                  return (
                    <li key={step.title}>
                      {stepIndex > 0 && (
                        <span
                          aria-hidden="true"
                          className={`ml-10 block h-3 w-0.5 transition-colors duration-220 ease-standard ${now.state === "queued" ? "bg-ink-200" : "bg-blue-300"}`}
                        />
                      )}
                      {/* On phones: icon and title, then a second line with the
                          source and the badge. From 640 px the badge has its
                          own fixed column, so the text never re-wraps as the
                          status changes. */}
                      <div
                        className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 rounded-lg border bg-surface px-4 py-3 transition-[opacity,border-color,box-shadow] duration-220 ease-standard sm:grid-cols-[auto_minmax(0,1fr)_7.5rem] sm:gap-y-1 ${rowStates[now.state]}`}
                      >
                        <span className="sm:row-span-2">
                          <IconTile icon={step.icon} />
                        </span>
                        <p className="col-span-2 text-ui font-semibold sm:col-span-1">{step.title}</p>
                        <p className="col-span-2 col-start-1 text-caption text-fg-muted sm:col-span-1 sm:col-start-2">
                          {step.by}
                        </p>
                        <span className="col-start-3 row-start-2 flex justify-end sm:row-span-2 sm:row-start-1">
                          <StatusBadge status={now.status} still={paused}>
                            {now.label}
                          </StatusBadge>
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
