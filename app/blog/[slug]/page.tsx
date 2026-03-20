import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import type { Metadata } from "next";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = getPostBySlug(slug);
    return { title: `${post.title} | Magnisale Blog`, description: post.excerpt };
  } catch {
    return {};
  }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <main
      style={{ background: "var(--background)", minHeight: "100vh" }}
      className="pt-32 pb-24 px-6"
    >
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link href="/blog" className="back-link">
          ← Back to Blog
        </Link>

        {/* Post header */}
        <header className="mb-10">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog?tag=${tag}`}
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
                  textDecoration: "none",
                }}
              >
                {tag}
              </Link>
            ))}
          </div>

          <h1
            style={{
              fontFamily: "var(--font-exo2)",
              fontWeight: 700,
              color: "#FFFFFF",
              fontSize: "clamp(1.75rem, 4.5vw, 2.5rem)",
              lineHeight: 1.2,
              marginBottom: "1rem",
            }}
          >
            {post.title}
          </h1>

          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "0.875rem",
              color: "var(--neutral-600)",
            }}
          >
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <div
            style={{
              height: "1px",
              background: "var(--neutral-800)",
              marginTop: "2rem",
            }}
          />
        </header>

        {/* MDX content */}
        <div className="prose">
          <MDXRemote source={post.content} />
        </div>

        {/* Footer nav */}
        <div
          style={{
            height: "1px",
            background: "var(--neutral-800)",
            marginTop: "3rem",
            marginBottom: "2rem",
          }}
        />
        <Link href="/blog" className="back-link" style={{ marginBottom: 0 }}>
          ← All posts
        </Link>
      </div>
    </main>
  );
}
