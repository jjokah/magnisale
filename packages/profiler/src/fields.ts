/**
 * The field registry: every field of the company profile, defined once.
 *
 * Validation, the profile page, and (in later milestones) the extraction
 * prompt, change review, completeness score and exports all read this list, so
 * adding a field here adds it everywhere. Stored profiles carry a schema
 * version, so fields can change without a database migration.
 */

export const PROFILE_SCHEMA_VERSION = 1;

export const SECTIONS = [
  { id: "identity", label: "Identity", core: true, description: "Who the business is." },
  { id: "story", label: "Story", core: true, description: "Why it exists and what sets it apart." },
  { id: "offerings", label: "Offerings", core: true, description: "What it sells." },
  { id: "customers", label: "Customers", core: true, description: "Who it sells to." },
  { id: "brandVoice", label: "Brand voice", core: true, description: "How it sounds." },
  { id: "contact", label: "Contact", core: true, description: "How to reach it." },
  { id: "team", label: "Team", core: false, description: "The people behind it." },
  { id: "proof", label: "Proof", core: false, description: "Why people should believe it." },
  { id: "goals", label: "Goals", core: false, description: "What it is working towards." },
  { id: "aiContext", label: "AI context", core: false, description: "What AI tools should know." },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
export const SECTION_IDS = SECTIONS.map((s) => s.id) as SectionId[];

export type SourceKind = "website" | "file" | "interview" | "followup" | "owner";

/** Where a value came from: the website, a named file, the interview, or the owner. */
export interface Source {
  kind: SourceKind;
  label: string;
  /** ISO-8601 UTC. */
  at: string;
}

export type ItemFieldKind = "text" | "longtext" | "tags";

export interface ItemFieldDef {
  key: string;
  label: string;
  kind: ItemFieldKind;
  help?: string;
}

export type ScalarKind =
  | "text"
  | "longtext"
  | "tags"
  | "year"
  | "url"
  | "email"
  | "phone"
  | "location"
  | "links"
  | "image";

interface BaseFieldDef {
  /** "section.key", the address used everywhere. */
  path: string;
  section: SectionId;
  key: string;
  label: string;
  /** Shown under the input while editing. */
  help?: string;
  /** Plain question for a busy owner when this field is missing. */
  hint: string;
  /** Share of the completeness score. Core fields total 80, flexible 20. */
  weight: number;
}

export type ScalarFieldDef = BaseFieldDef & { kind: ScalarKind };

export type CollectionFieldDef = BaseFieldDef & {
  kind: "collection";
  /** Singular name for one entry, as in "Add a product or service". */
  itemLabel: string;
  /** The item field that names an entry. It is required. */
  titleField: string;
  itemFields: ItemFieldDef[];
};

export type FieldDef = ScalarFieldDef | CollectionFieldDef;

type Options = { help?: string };

function scalar(
  section: SectionId,
  key: string,
  label: string,
  kind: ScalarKind,
  weight: number,
  hint: string,
  options: Options = {},
): ScalarFieldDef {
  return { path: `${section}.${key}`, section, key, label, kind, weight, hint, ...options };
}

function collection(
  section: SectionId,
  key: string,
  label: string,
  weight: number,
  hint: string,
  itemLabel: string,
  itemFields: [ItemFieldDef, ...ItemFieldDef[]],
): CollectionFieldDef {
  return {
    path: `${section}.${key}`,
    section,
    key,
    label,
    kind: "collection",
    weight,
    hint,
    itemLabel,
    titleField: itemFields[0].key,
    itemFields,
  };
}

export const FIELDS: FieldDef[] = [
  // Identity: 24
  scalar("identity", "brandName", "Brand name", "text", 5, "What do customers call your business?"),
  scalar("identity", "legalName", "Legal name", "text", 2, "What is the registered name of the company?", {
    help: "As registered, for example with the CAC.",
  }),
  scalar("identity", "oneLiner", "One-liner", "text", 6, "In one sentence, what does your business do and for whom?", {
    help: "One sentence, under 25 words.",
  }),
  scalar("identity", "industry", "Industry", "text", 4, "Which industry are you in?"),
  scalar("identity", "yearFounded", "Year founded", "year", 1, "What year was the business started?"),
  scalar("identity", "headquarters", "Headquarters", "location", 4, "Where is your head office?"),
  scalar("identity", "logo", "Logo", "image", 2, "Can you add your logo?", {
    help: "PNG, JPEG or WebP, up to 5 MB.",
  }),

  // Story: 14
  scalar("story", "about", "About", "longtext", 6, "How would you describe the business to a new customer?", {
    help: "3 to 5 sentences.",
  }),
  scalar("story", "mission", "Mission", "longtext", 2, "What is the business trying to achieve for its customers?"),
  scalar("story", "values", "Values", "tags", 2, "What values guide how you work?"),
  scalar("story", "differentiators", "What makes you different", "longtext", 4, "Why do customers choose you over others?"),

  // Offerings: 14
  collection("offerings", "items", "Products and services", 14, "What are your main products or services?", "product or service", [
    { key: "name", label: "Name", kind: "text" },
    { key: "category", label: "Category", kind: "text" },
    { key: "description", label: "Description", kind: "longtext" },
    { key: "benefits", label: "Key benefits", kind: "tags" },
    { key: "audience", label: "Who it is for", kind: "text" },
    { key: "pricingModel", label: "Pricing model", kind: "text", help: "Optional, for example per project or monthly." },
  ]),

  // Customers: 14
  scalar("customers", "idealIndustries", "Ideal customer industries", "tags", 3, "Which industries do your best customers work in?"),
  scalar("customers", "idealCompanySize", "Ideal company size", "text", 2, "How big are your best customers?", {
    help: "For example, 10 to 200 staff.",
  }),
  scalar("customers", "idealLocations", "Ideal customer locations", "tags", 2, "Where are your best customers based?"),
  scalar("customers", "decisionMakerTitles", "Decision-maker titles", "tags", 3, "Who usually decides to buy from you?"),
  scalar("customers", "buyingSignals", "Buying signals", "tags", 2, "What tells you a business is ready to buy?"),
  scalar("customers", "notAFit", "Who is not a fit", "tags", 2, "Which customers should you turn away?"),

  // Brand voice: 6
  scalar("brandVoice", "toneWords", "Tone words", "tags", 2, "Which words describe how your brand sounds?"),
  scalar("brandVoice", "wordsToUse", "Words to use", "tags", 1, "Are there words you always like to use?"),
  scalar("brandVoice", "wordsToAvoid", "Words to avoid", "tags", 1, "Are there words you never want to use?"),
  scalar("brandVoice", "styleRules", "Style rules", "tags", 2, "Do you have any writing rules, such as British spelling?"),

  // Contact: 8
  scalar("contact", "website", "Website", "url", 3, "What is your website address?"),
  scalar("contact", "socialLinks", "Social links", "links", 1, "Which social accounts do you use?"),
  scalar("contact", "email", "Email", "email", 2, "Which email should customers use?"),
  scalar("contact", "phone", "Phone", "phone", 1, "Which phone number should customers use?"),
  scalar("contact", "preferredChannels", "Preferred channels", "tags", 1, "How do you prefer customers to reach you?", {
    help: "For example, WhatsApp or email.",
  }),

  // Team: 5
  collection("team", "people", "Key people", 4, "Who are the key people in the business?", "person", [
    { key: "name", label: "Name", kind: "text" },
    { key: "title", label: "Title", kind: "text" },
    { key: "bio", label: "Short bio", kind: "longtext" },
  ]),
  scalar("team", "sizeRange", "Team size", "text", 1, "Roughly how many people work in the business?", {
    help: "A range is fine, for example 11 to 50.",
  }),

  // Proof: 7
  scalar("proof", "certifications", "Certifications", "tags", 1, "Do you hold any certifications or licences?"),
  scalar("proof", "awards", "Awards", "tags", 1, "Has the business won any awards?"),
  scalar("proof", "notableClients", "Notable clients", "tags", 2, "Which well-known clients can you name?"),
  collection("proof", "caseStudies", "Case studies", 3, "Can you share a result you achieved for a client?", "case study", [
    { key: "title", label: "Title", kind: "text" },
    { key: "challenge", label: "Challenge", kind: "longtext" },
    { key: "result", label: "Result", kind: "longtext" },
  ]),

  // Goals: 3
  scalar("goals", "currentFocus", "Current focus", "longtext", 2, "What is the business focused on right now?"),
  scalar("goals", "yearGoals", "Goals for the year", "tags", 1, "What are your main goals for this year?"),

  // AI context: 5
  collection("aiContext", "faqs", "FAQs", 1, "What do customers ask you most often?", "question", [
    { key: "question", label: "Question", kind: "text" },
    { key: "answer", label: "Answer", kind: "longtext" },
  ]),
  scalar("aiContext", "aiTasks", "Tasks you use AI for", "tags", 1, "What do you use AI tools for?"),
  scalar("aiContext", "sampleOutputs", "Sample outputs you liked", "tags", 1, "Do you have an example of AI writing you liked?"),
  scalar("aiContext", "topicsToAvoid", "Topics to avoid", "tags", 1, "Are there topics AI should never discuss for you?"),
  scalar("aiContext", "languages", "Languages", "tags", 1, "Which languages do you work in?"),
];

const BY_PATH = new Map(FIELDS.map((f) => [f.path, f]));

export function getField(path: string): FieldDef | undefined {
  return BY_PATH.get(path);
}

export function fieldsInSection(section: SectionId): FieldDef[] {
  return FIELDS.filter((f) => f.section === section);
}
