"use client";

// no local state needed for comments; CommentSection manages local additions
import { HeaderSection, CommentSection, ContentSection } from "@component/blog";
import { useRouter, useParams } from "next/navigation";
import { blog } from "@content/site/blog";
import type { BlogPost, BlogComment } from "@/types/site";
import { Button } from "@ui/button";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  const navigate = useRouter();
  const params = useParams();
  const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;

  const matchPath = slug ? `/blog/${slug}` : undefined;

  let found: BlogPost | undefined = undefined;

  if (matchPath) {
    found = blog.posts.find((p) => p.href === matchPath);

    if (!found) {
      const recent = blog.recentPosts.find((r) => r.href === matchPath);
      if (recent) {
        found = {
          title: recent.title,
          author: { name: recent.author ?? "" },
          publishedDate: recent.date ?? "",
          content: recent.excerpt ? [recent.excerpt] : [],
          coverImage: recent.image,
        } as BlogPost;
      }
    }
  }

  // Determine comments for this post via id-based mapping. Prefer mappings
  // (commentsByPostId + commentsById) and fallback to legacy blog.comments.
  if (!found) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-20 lg:py-24">
        <h2 className="text-2xl font-bold">Post not found</h2>
        <p className="mt-4">
          We couldn&apos;t find the post you&apos;re looking for.
        </p>
        <div className="mt-6">
          <button onClick={() => navigate.push("/blog")} className="btn">
            Back to blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16 md:py-20 lg:py-24">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate.push("/blog")}
            className="flex items-center gap-2 hover:bg-[var(--card)] hover:text-[var(--card-foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to blog</span>
          </Button>
        </div>

        <HeaderSection
          category={found.category ?? ""}
          title={found.title}
          author={{
            name: found.author?.name ?? "",
            avatar: found.author?.avatar ?? "/placeholder.svg",
          }}
          publishedDate={found.publishedDate ?? ""}
          onBack={() => navigate.push("/blog")}
        />

        <div className="mt-12 md:mt-16">
          <ContentSection
            content={found.content ?? []}
            coverImage={found.coverImage}
          />
        </div>

        <div className="mt-12 md:mt-16">
          {/* resolve by post id -> comment ids -> comment objects */}
          <CommentSection
            comments={((): BlogComment[] => {
              const postId = found?.id;
              if (!postId) return blog.comments;
              const commentsByPostId = (
                blog as unknown as {
                  commentsByPostId?: Record<string, string[]>;
                }
              ).commentsByPostId;
              const commentsById = (
                blog as unknown as {
                  commentsById?: Record<string, BlogComment>;
                }
              ).commentsById;
              const ids = commentsByPostId?.[postId];
              if (!ids || !commentsById) return blog.comments;
              return ids
                .map((id) => commentsById[id])
                .filter(Boolean) as BlogComment[];
            })()}
          />
        </div>
      </div>
    </div>
  );
}
