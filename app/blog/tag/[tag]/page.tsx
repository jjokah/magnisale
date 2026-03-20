import { redirect } from "next/navigation";
import { getAllTags } from "@/lib/posts";

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  redirect(`/blog?tag=${tag}`);
}
