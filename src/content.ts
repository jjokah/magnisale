// Every word on the page lives here. Voice rules (design system, board 06):
// sentence case, "we" and "you", British spelling, outcome first, buttons
// start with a verb, "AI agents" not "bots", no numbers we cannot stand behind.
import {
  Check,
  FileCheck,
  Lock,
  Mail,
  MessageSquare,
  Search,
  Settings,
  Undo2,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export const site = {
  name: "Magnisale",
  tagline: "Scale with AI",
  email: "hello@magnisale.com",
  about:
    "Magnisale helps forward-thinking businesses in Nigeria scale with AI. We build AI agents and automated workflows tailored to how your business really runs, so your team gets more done with fewer errors and better results.",
  social: [
    { label: "X", href: "https://x.com/magnisale" },
    { label: "LinkedIn", href: "https://linkedin.com/company/magnisale" },
  ],
};

export const cta = {
  label: "Book a discovery call",
  href: `mailto:${site.email}?subject=${encodeURIComponent("Discovery call")}`,
};

export const nav = [
  { label: "Solutions", href: "#solutions" },
  { label: "How we work", href: "#how-we-work" },
  { label: "Data privacy", href: "#data-privacy" },
];

export const hero = {
  eyebrow: site.tagline,
  title: "AI agents built around how your business runs",
  lede: "We build AI agents and automated workflows tailored to how your business really runs, so your team gets more done with fewer errors and better results.",
  secondary: { label: "See how we work", href: "#how-we-work" },
};

export type Status = "neutral" | "success" | "warning";

export const workflow: {
  label: string;
  steps: { icon: LucideIcon; title: string; by: string; status: Status; statusLabel: string }[];
} = {
  label: "Example workflow · customer enquiry",
  steps: [
    {
      icon: MessageSquare,
      title: "Customer asks about an order",
      by: "WhatsApp message",
      status: "neutral",
      statusLabel: "Received",
    },
    {
      icon: Search,
      title: "Agent checks your stock and price list",
      by: "Support agent",
      status: "success",
      statusLabel: "Done",
    },
    {
      icon: Mail,
      title: "Agent drafts a reply in your tone",
      by: "Support agent",
      status: "success",
      statusLabel: "Done",
    },
    {
      icon: Check,
      title: "Your team approves and sends",
      by: "You stay in control",
      status: "warning",
      statusLabel: "Needs review",
    },
  ],
};

export const solutions: {
  eyebrow: string;
  title: string;
  lede: string;
  items: { icon: LucideIcon; title: string; body: string }[];
  other: { text: string; link: string };
} = {
  eyebrow: "Solutions",
  title: "AI agents for the work that slows your team down",
  lede: "Unlike generic tools, we start by understanding your business, then build what fits your needs, budget and privacy requirements.",
  items: [
    {
      icon: Mail,
      title: "Sales outreach",
      body: "AI agents that find the right prospects and draft outreach for your team to approve.",
    },
    {
      icon: MessageSquare,
      title: "Customer support",
      body: "AI agents that answer customers using your own business knowledge.",
    },
    {
      icon: Settings,
      title: "Operations",
      body: "AI agents that take on routine reports, records and follow-ups, so less slips through.",
    },
    {
      icon: Workflow,
      title: "Workflows",
      body: "Automated workflows that move work between your people and your tools without retyping.",
    },
  ],
  other: {
    text: "Need something specific to your business?",
    link: "Tell us about it",
  },
};

export const process = {
  eyebrow: "How we work",
  title: "Discovery, build, training",
  lede: "Three steps, from a first conversation to AI agents your team uses every day.",
  steps: [
    {
      title: "Discovery",
      body: "A first call to understand your business and what it needs.",
    },
    {
      title: "Build",
      body: "We build your AI agents and workflows around the way your team already works.",
    },
    {
      title: "Training",
      body: "We train your team to use what we built, so it becomes part of the working day.",
    },
  ],
  included: {
    eyebrow: "Included",
    title: "Three months of maintenance",
    body: "Every project fee covers maintenance for the first three months.",
  },
};

export const privacy: {
  eyebrow: string;
  title: string;
  lede: string;
  points: { icon: LucideIcon; title: string; body: string }[];
} = {
  eyebrow: "Data privacy",
  title: "Your data stays yours",
  lede: "Private by design, compliant with Nigerian law, and never used beyond your project.",
  points: [
    {
      icon: Undo2,
      title: "Returned or deleted on request",
      body: "Ask at any time and we return your data or delete it.",
    },
    {
      icon: Lock,
      title: "Private deployment option",
      body: "For sensitive work, we can deploy your AI agents privately.",
    },
    {
      icon: FileCheck,
      title: "Confidentiality agreement",
      body: "Ask for one before the discovery call and we will send it first.",
    },
  ],
};

export const contact = {
  eyebrow: "Start here",
  title: "Tell us about the work you want to speed up",
  body: "The discovery call is free, with no commitment. Every project is scoped around your business, and we reply within 24 hours.",
};
