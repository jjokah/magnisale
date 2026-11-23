import { StatusBadge } from "./StatusBadge";
import { formatDate, type PostMeta, type Tag } from "../blog/posts";
import { blog } from "../content";
import { postPath, tagPath } from "../routes";

// A post's topics as links. Pills on the blog's pages; inside a card, plain
// eyebrow links, so the card's title stays the strongest thing on it. Both
// keep a 44 px tap target.
export function TagLinks({ tags, current, compact = false }: { tags: Tag[]; current?: string; compact?: boolean }) {
  if (tags.length === 0) return null;
  const linkClass = compact
    ? "t-eyebrow inline-flex min-h-11 items-center text-action underline-offset-4 hover:underline"
    : "inline-flex min-h-11 items-center rounded-pill border border-line-control px-4 text-ui font-medium transition-[border-color] duration-140 ease-standard hover:border-fg aria-[current]:border-action aria-[current]:bg-action-tint aria-[current]:text-action";
  return (
    <ul className={`flex flex-wrap ${compact ? "gap-x-4" : "gap-2"}`}>
      {tags.map((tag) => (
        <li key={tag.slug}>
          <a
            href={tagPath(tag.slug)}
            aria-current={current === tag.slug ? "page" : undefined}
            className={linkClass}
          >
            {tag.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

// The whole card opens the post: the title's link stretches over it, and its
// focus ring moves to that stretched area so it outlines the card. The topic
// links sit above it, so they stay clickable on their own.
export function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="card relative flex h-full flex-col gap-3 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <p className="t-eyebrow text-fg-muted">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>
        {post.draft && <StatusBadge status="warning">{blog.draft}</StatusBadge>}
      </div>
      <h2 className="t-h3">
        <a
          href={postPath(post.slug)}
          className="after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-focus"
        >
          {post.title}
        </a>
      </h2>
      <p className="text-fg-muted">{post.description}</p>
      {post.tags.length > 0 && (
        <div className="relative mt-auto pt-1">
          <TagLinks tags={post.tags} compact />
        </div>
      )}
    </article>
  );
}
