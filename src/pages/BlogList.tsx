import { ArrowLeft } from "lucide-react";
import { PostCard, TagLinks } from "../components/PostCard";
import { posts, postsTagged, tags, type Tag } from "../blog/posts";
import { blog } from "../content";
import { blogPath } from "../routes";

// The blog's index at /blog/, and the same page narrowed to one topic at
// /blog/tags/<topic>/.
export function BlogList({ tag }: { tag: Tag | null }) {
  const list = tag ? postsTagged(tag.slug) : posts;

  return (
    <>
      {/* id="top": the phone call-to-action bar stays out of the way while
          this header is on screen, as it does over the home page's hero. */}
      <header id="top" className="hero">
        <div className="wrap flex flex-col gap-8 py-12 lg:gap-10 lg:py-16">
          <div className="reveal flex max-w-[47.5rem] flex-col items-start gap-4">
            {tag && (
              <a href={blogPath} className="link link-back min-h-11">
                <ArrowLeft size={18} strokeWidth={1.75} aria-hidden="true" />
                {blog.allPosts}
              </a>
            )}
            <p className="t-eyebrow text-action">{tag ? blog.topic : blog.eyebrow}</p>
            <h1 className="t-h1">{tag ? tag.label : blog.title}</h1>
            <p className="t-lede">{tag ? blog.topicLede(tag.label) : blog.lede}</p>
          </div>

          {tags.length > 0 && (
            <nav aria-label={blog.topics} className="reveal flex flex-col gap-3 [--i:1]">
              <p className="t-eyebrow text-fg-muted">{blog.topics}</p>
              <TagLinks tags={tags} current={tag?.slug} />
            </nav>
          )}
        </div>
      </header>

      <section className="section bg-surface-subtle">
        <div className="wrap">
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((post) => (
              <li key={post.slug}>
                <PostCard post={post} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
