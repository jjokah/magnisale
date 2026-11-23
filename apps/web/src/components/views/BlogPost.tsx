import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button, StatusBadge } from "@magnisale/ui";
import { TagLinks } from "../PostCard";
import { formatDate, type PostMeta } from "../../blog/meta";
import { blog, cta } from "../../content/site";
import { blogPath } from "../../routes";

// One post, in a reading column about 42rem wide. The body is HTML rendered
// from the post's Markdown at build time (src/blog/posts.ts).
export function BlogPost({ post, html }: { post: PostMeta; html: string }) {
  return (
    <article>
      {/* id="top": the phone call-to-action bar stays out of the way while
          this header is on screen. */}
      <header id="top" className="hero">
        <div className="wrap py-10 lg:py-16">
          <div className="reveal mx-auto flex max-w-[42rem] flex-col items-start gap-4">
            <a href={blogPath} className="link link-back min-h-11">
              <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
              {blog.allPosts}
            </a>
            <div className="flex flex-wrap items-center gap-3">
              <p className="t-eyebrow text-action">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </p>
              {post.draft && <StatusBadge status="warning">{blog.draft}</StatusBadge>}
            </div>
            <h1 className="t-h1">{post.title}</h1>
            <p className="t-lede">{post.description}</p>
            <TagLinks tags={post.tags} />
          </div>
        </div>
      </header>

      <div className="wrap pb-16 lg:pb-24">
        <div className="prose mx-auto max-w-[42rem]" dangerouslySetInnerHTML={{ __html: html }} />

        {/* id="post-cta": the phone call-to-action bar hides while this is on
            screen, so the page never shows the same action twice. */}
        <aside
          id="post-cta"
          className="card mx-auto mt-16 flex max-w-[42rem] flex-col items-start gap-4 p-6 sm:p-8"
        >
          <h2 className="t-h3">{blog.cta.title}</h2>
          <p className="text-fg-muted">{blog.cta.body}</p>
          <Button href={cta.href}>
            {cta.label}
            <ArrowRight size={20} strokeWidth={1.75} aria-hidden="true" />
          </Button>
        </aside>
      </div>
    </article>
  );
}
