import { faq, site } from "../content";

// Search engines read this. It is built from content.ts, so it cannot drift
// from what the page says.
const data = [
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    url: site.url,
    image: `${site.url}og.png`,
    email: site.email,
    slogan: site.tagline,
    description: site.about,
    areaServed: { "@type": "Country", name: "Nigeria" },
    sameAs: site.social.map((item) => item.href),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  },
];

export function StructuredData() {
  // "<" is escaped so no text can close the script element early.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
