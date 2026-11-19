// Every word on the page lives here. Voice rules (design system, board 06):
// sentence case, "we" and "you", British spelling, outcome first, buttons
// start with a verb, "AI agents" not "bots", no numbers we cannot stand behind.
import {
  Calculator,
  CalendarClock,
  Check,
  FileCheck,
  FileText,
  Globe,
  Lock,
  Mail,
  MessageCircle,
  MessageSquare,
  PenLine,
  Search,
  Settings,
  ShieldCheck,
  Table,
  Undo2,
  Users,
  UserSearch,
  Workflow,
  type LucideIcon,
} from "lucide-react";

export const site = {
  name: "Magnisale",
  tagline: "Scale with AI",
  url: "https://magnisale.com/",
  email: "hello@magnisale.com",
  // Your WhatsApp number in international format, digits only, for example
  // "2348012345678". Every WhatsApp button stays hidden while this is empty.
  whatsapp: "2347066963636",
  whatsappMessage: "Hello Magnisale, I would like to book a discovery call.",
  // Your Web3Forms access key (https://web3forms.com). Enquiries are forwarded
  // to the inbox the key was created with. The enquiry form stays hidden while
  // this is empty, and the contact section offers email instead.
  formKey: "6b5c3e85-8494-46f7-8bce-73dbb5d2258e",
  formEndpoint: "https://api.web3forms.com/submit",
  about: "Magnisale builds AI agents and automated workflows for businesses in Nigeria.",
  social: [
    { label: "X (Twitter)", href: "https://x.com/magnisale" },
    { label: "LinkedIn", href: "https://linkedin.com/company/magnisale" },
  ],
};

export const whatsappHref = site.whatsapp
  ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`
  : null;

// The one call to action. It leads to the contact section, where a visitor can
// send an enquiry, open WhatsApp or email.
export const cta = {
  label: "Book a discovery call",
  // For the phone bar, where the full label does not fit beside WhatsApp.
  short: "Book a call",
  href: "#contact",
};

export const whatsappCta = "Chat on WhatsApp";

export const nav = [
  { label: "Solutions", href: "#solutions" },
  { label: "How we work", href: "#how-we-work" },
  { label: "Data privacy", href: "#data-privacy" },
  { label: "FAQ", href: "#faq" },
];

const reassurance = ["Free discovery call", "No commitment", "Reply within 24 hours"];

export const hero = {
  eyebrow: "AI agents for Nigerian businesses",
  title: "AI agents that take the routine work off your team",
  lede: "We design, build and maintain AI agents around the way your business already runs: replying to customers, following up leads, keeping records up to date. Your team approves what matters.",
  trust: reassurance,
  secondary: { label: "See how we work", href: "#how-we-work" },
};

export type Status = "neutral" | "success" | "warning";

type Step = { icon: LucideIcon; title: string; by: string; status: Status; statusLabel: string };

// The hero's example. Each tab plays through its steps; the last step always
// waits for a person, because your team stays in control.
export const workflowUi = {
  caption: "Example workflows: how an AI agent handles a routine task",
  tabs: "Choose an example",
  working: "Working",
  queued: "Queued",
  pause: "Pause the example",
  play: "Play the example",
};

export const workflows: { tab: string; label: string; steps: Step[] }[] = [
  {
    tab: "Support",
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
        icon: PenLine,
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
  },
  {
    tab: "Sales",
    label: "Example workflow · sales outreach",
    steps: [
      {
        icon: UserSearch,
        title: "A new prospect fits your ideal customer",
        by: "Prospect list",
        status: "neutral",
        statusLabel: "Found",
      },
      {
        icon: Search,
        title: "Agent researches the business",
        by: "Sales agent",
        status: "success",
        statusLabel: "Done",
      },
      {
        icon: Mail,
        title: "Agent drafts a first message",
        by: "Sales agent",
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
  },
  {
    tab: "Operations",
    label: "Example workflow · weekly report",
    steps: [
      {
        icon: CalendarClock,
        title: "The weekly report falls due",
        by: "Schedule",
        status: "neutral",
        statusLabel: "Started",
      },
      {
        icon: Table,
        title: "Agent gathers figures from your records",
        by: "Operations agent",
        status: "success",
        statusLabel: "Done",
      },
      {
        icon: FileText,
        title: "Agent prepares the report",
        by: "Operations agent",
        status: "success",
        statusLabel: "Done",
      },
      {
        icon: Check,
        title: "Your team reviews and shares",
        by: "You stay in control",
        status: "warning",
        statusLabel: "Needs review",
      },
    ],
  },
];

// TO CONFIRM: list only tools you are happy to say you work with.
export const tools: { label: string; items: { icon: LucideIcon; label: string }[] } = {
  label: "Works with the tools you already use",
  items: [
    { icon: MessageCircle, label: "WhatsApp" },
    { icon: Mail, label: "Email" },
    { icon: Table, label: "Spreadsheets" },
    { icon: Users, label: "CRM" },
    { icon: Calculator, label: "Accounting" },
    { icon: Globe, label: "Your website" },
  ],
};

export const solutions: {
  eyebrow: string;
  title: string;
  lede: string;
  items: { icon: LucideIcon; title: string; body: string; examples: string[] }[];
  other: { text: string; link: string };
} = {
  eyebrow: "Solutions",
  title: "Start with the work that slows your team down",
  lede: "We start by understanding your business, then build what fits your needs, budget and privacy requirements.",
  items: [
    {
      icon: MessageSquare,
      title: "Customer support",
      body: "Customers get correct answers sooner, drawn from your own business knowledge.",
      examples: [
        "Answers order, stock and price questions",
        "Drafts replies in your tone",
        "Passes unusual cases to your team",
      ],
    },
    {
      icon: Mail,
      title: "Sales outreach",
      body: "The right prospects hear from you, and every message is approved by your team.",
      examples: [
        "Finds prospects that fit your ideal customer",
        "Drafts outreach for your team to approve",
        "Follows up so no lead goes quiet",
      ],
    },
    {
      icon: Settings,
      title: "Operations",
      body: "Routine reports, records and follow-ups get done on time, so less slips through.",
      examples: ["Prepares routine reports", "Keeps records up to date", "Chases outstanding follow-ups"],
    },
    {
      icon: Workflow,
      title: "Workflows",
      body: "Work moves between your people and your tools without anyone retyping it.",
      examples: [
        "Sends each request to the right person",
        "Copies details from one tool to the next",
        "Flags anything that needs a decision",
      ],
    },
  ],
  other: {
    text: "Need something specific to your business?",
    link: "Tell us about it",
  },
};

export const process = {
  eyebrow: "How we work",
  title: "From first call to everyday use",
  lede: "From a first conversation to AI agents your team uses every day, with three months of maintenance included.",
  getLabel: "You get",
  includedLabel: "Included",
  steps: [
    {
      title: "Discovery",
      body: "A first call to understand your business and what it needs.",
      get: "A project scoped around your business",
      included: false,
    },
    {
      title: "Build",
      body: "We build your AI agents and workflows around the way your team already works.",
      get: "AI agents that fit your tools and your process",
      included: false,
    },
    {
      title: "Training",
      body: "We train your team to use what we built, so it becomes part of the working day.",
      get: "A team confident with its AI agents",
      included: false,
    },
    {
      title: "Maintenance",
      body: "Every project fee covers maintenance for the first three months.",
      get: "Three months of maintenance",
      included: true,
    },
  ],
};

export const privacy: {
  eyebrow: string;
  title: string;
  lede: string;
  points: { icon: LucideIcon; title: string; body: string }[];
} = {
  eyebrow: "Data privacy",
  title: "Your data stays yours",
  // TO CONFIRM: if you are happy to name the law, "compliant with the Nigeria
  // Data Protection Act" is more specific than "Nigerian law".
  lede: "Private by design and compliant with Nigerian law.",
  points: [
    {
      icon: ShieldCheck,
      title: "Used only for your project",
      body: "Your data is never used beyond the project you hired us for.",
    },
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

// Real results and testimonials only. The section stays off the page while
// `items` is empty. Example entry:
//   {
//     result: "The outcome in a few words",        (optional)
//     quote: "What the client said, in their words.",
//     name: "Client name",
//     role: "Role, Company",
//   }
export type Testimonial = { result?: string; quote: string; name: string; role: string };

export const proof: { eyebrow: string; title: string; lede: string; items: Testimonial[] } = {
  eyebrow: "Results",
  title: "What our clients say",
  lede: "Businesses we work with, in their own words.",
  items: [
    {
      quote: "I have first-hand experience with Magnisale. They are good at what they do. Very reliable.",
      name: "Chibuike Odo",
      role: "CEO, Iken Care",
    },
  ],
};

export const faq: { eyebrow: string; title: string; lede: string; items: { q: string; a: string }[] } = {
  eyebrow: "FAQ",
  title: "Questions we hear most",
  lede: "If yours is not here, ask us. We reply within 24 hours.",
  items: [
    {
      q: "How much does it cost?",
      a: "Every project is scoped around your business, so the fee depends on what we build. The discovery call is free, and the project fee covers maintenance for the first three months.",
    },
    {
      q: "Do we need technical staff?",
      a: "No. We build your AI agents and train your team to use them, so they become part of the working day.",
    },
    {
      q: "Do the AI agents act on their own?",
      a: "Your team stays in control. AI agents do the checking, drafting and preparing, and your team approves what matters before it goes out.",
    },
    {
      q: "What happens to our data?",
      a: "It is used only for your project. Ask at any time and we return it or delete it. For sensitive work we can deploy your AI agents privately, and we will sign a confidentiality agreement before the discovery call if you ask.",
    },
    {
      q: "What if we need something that is not listed here?",
      a: "Tell us about it. We start by understanding your business, then build what fits your needs, budget and privacy requirements.",
    },
    // TO ADD once you confirm the answers:
    // { q: "How long does a project take?", a: "…" },
    // { q: "What happens after the three months of maintenance?", a: "…" },
  ],
};

export const contact = {
  eyebrow: "Start here",
  title: "Tell us about the work you want to speed up",
  body: "Send a few lines about your business. The discovery call is free, and every project is scoped around what you need.",
  trust: reassurance,
  emailCta: "Email us",
  copy: "Copy email address",
  copied: "Email address copied",
  form: {
    title: "Book a discovery call",
    subject: "New enquiry from magnisale.com",
    name: "Your name",
    business: "Business name",
    contact: "Email or WhatsApp number",
    message: "What would you like to speed up?",
    messageHint: "A sentence or two is enough.",
    submit: "Send enquiry",
    sending: "Sending…",
    note: "We use your details only to reply to your enquiry.",
    sentTitle: "Thank you. Your enquiry is with us.",
    sentBody: "We reply within 24 hours to arrange your discovery call.",
    failed: "That did not send. Please try again, or email us at",
  },
};

export const footer = {
  explore: "Explore",
  contact: "Contact",
  contactLink: { label: "Contact", href: "#contact" },
  whatsapp: "WhatsApp",
};
