import { faq, site } from "../content";
import { postPath, type Route } from "../routes";

// Search engines read this. It is built from content.ts and the posts, so it
// cannot drift from what the page says.
const organization = {
  "@context": "https://schema.org",
  // Organization rather than a LocalBusiness type, which Google expects to
  // carry a street address.
  "@type": "Organization",
  name: site.name,
  url: site.url,
  logo: `${site.url}apple-touch-icon.png`,
  image: `${site.url}og.png`,
  email: site.email,
  ...(site.whatsapp && { telephone: `+${site.whatsapp}` }),
  slogan: site.tagline,
  description: site.about,
  areaServed: { "@type": "Country", name: "Nigeria" },
  sameAs: site.social.map((item) => item.href),
};

// Only on the home page: Google expects FAQ data to match questions shown on
// the page.
const faqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

function data(route: Route) {
  if (route.kind === "home") return [organization, faqPage];
  if (route.kind === "blog") return [organization];
  const { post } = route;
  const url = new URL(postPath(post.slug), site.url).href;
  const publisher = { "@type": "Organization", name: site.name, url: site.url, logo: organization.logo };
  return [
    organization,
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      url,
      mainEntityOfPage: url,
      image: organization.image,
      inLanguage: "en-GB",
      ...(post.tags.length > 0 && { keywords: post.tags.map((tag) => tag.label).join(", ") }),
      author: publisher,
      publisher,
    },
  ];
}

export function StructuredData({ route }: { route: Route }) {
  // "<" is escaped so no text can close the script element early.
  const json = JSON.stringify(data(route)).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
