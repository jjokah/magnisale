import Image from "next/image";
import Link from "next/link";
import { getAllPosts, getAllTags } from "@/lib/posts";

interface BlogPageProps {
  searchParams: Promise<{ tag?: string }>;
}

export const metadata = {
  title: "Blog | Magnisale",
  description:
    "Insights on sales automation, outreach strategy, and revenue growth from the Magnisale team.",
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { tag: activeTag } = await searchParams;
  const allPosts = getAllPosts();
  const allTags = getAllTags();

  const posts = activeTag
    ? allPosts.filter((p) => p.tags.includes(activeTag))
    : allPosts;

  return (
    <main
      style={{ background: "var(--background)", minHeight: "100vh" }}
      className="pt-32 pb-24 px-6"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="section-label mb-4" style={{ textDecoration: "none" }}>←Magnisale</Link>
          <h1
            style={{
              fontFamily: "var(--font-exo2)",
              fontWeight: 700,
              color: "#FFFFFF",
              fontSize: "clamp(2.5rem, 7vw, 3rem)",
              lineHeight: 1.15,
            }}
          >
            Blog
          </h1>
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              color: "var(--neutral-400)",
              fontSize: "1.125rem",
              marginTop: "0.75rem",
            }}
          >
            Technology updates, sales insights, and news from the Magnisale team.
          </p>
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            <Link
              href="/blog"
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: "0.8125rem",
                fontWeight: 500,
                padding: "0.375rem 0.875rem",
                borderRadius: "var(--radius-full)",
                border: `1px solid ${!activeTag ? "var(--primary-mid)" : "var(--neutral-700)"}`,
                background: !activeTag
                  ? "rgba(58, 110, 255, 0.15)"
                  : "transparent",
                color: !activeTag ? "var(--primary-mid)" : "var(--neutral-400)",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              All
            </Link>
            {allTags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  padding: "0.375rem 0.875rem",
                  borderRadius: "var(--radius-full)",
                  border: `1px solid ${activeTag === tag ? "var(--primary-mid)" : "var(--neutral-700)"}`,
                  background:
                    activeTag === tag
                      ? "rgba(58, 110, 255, 0.15)"
                      : "transparent",
                  color:
                    activeTag === tag
                      ? "var(--primary-mid)"
                      : "var(--neutral-400)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Post list */}
        <div className="flex flex-col gap-6">
          {posts.length === 0 && (
            <p
              style={{
                fontFamily: "var(--font-dm-sans)",
                color: "var(--neutral-500)",
              }}
            >
              No posts found.
            </p>
          )}
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ textDecoration: "none" }}
            >
              <article className="post-card">
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: "var(--font-dm-sans)",
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--accent)",
                        background: "rgba(0, 229, 255, 0.08)",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "var(--radius-full)",
                        border: "1px solid rgba(0, 229, 255, 0.2)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontFamily: "var(--font-exo2)",
                    fontWeight: 600,
                    fontSize: "1.25rem",
                    color: "#FFFFFF",
                    marginBottom: "0.5rem",
                    lineHeight: 1.3,
                  }}
                >
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    color: "var(--neutral-400)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.6,
                    marginBottom: "1rem",
                  }}
                >
                  {post.excerpt}
                </p>

                {/* Date */}
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans)",
                    fontSize: "0.8125rem",
                    color: "var(--neutral-600)",
                  }}
                >
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </article>
            </Link>
          ))}
        </div>

        {/* Logo */}
        <Link href="/" className="flex justify-center items-center gap-3 mt-16 opacity-40 transition-opacity duration-200 hover:opacity-100" style={{ textDecoration: "none" }}>
          <Image
            src="/magnisale-logo-icon.png"
            alt="Magnisale"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span
            className="text-white text-[15px] tracking-[0.08em] uppercase"
            style={{
              fontFamily: "var(--font-exo2, 'Exo 2', sans-serif)",
              fontWeight: 700,
            }}
          >
            Magnisale
          </span>
        </Link>
      </div>
    </main>
  );
}
