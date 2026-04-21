"use client";

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

  if (!found) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-20 lg:py-24">
        <h2 className="text-foreground text-2xl font-bold">Post not found</h2>
        <p className="text-muted-foreground mt-4">
          We couldn&apos;t find the post you&apos;re looking for.
        </p>
        <div className="mt-6">
          <Button variant="outline" onClick={() => navigate.push("/blog")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to blog
          </Button>
        </div>
      </div>
    );
  }

  // Resolve comments for this post
  const resolveComments = (): BlogComment[] => {
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
    return ids.map((id) => commentsById[id]).filter(Boolean) as BlogComment[];
  };

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-3xl px-6 pt-12 pb-24 md:pt-16 lg:pt-20">
        {/* Back button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate.push("/blog")}
            className="text-muted-foreground hover:text-foreground -ml-2 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Button>
        </div>

        {/* Header */}
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

        {/* Content */}
        <div className="mt-10 md:mt-14">
          <ContentSection
            content={found.content ?? []}
            coverImage={found.coverImage}
          />
        </div>

        {/* Divider */}
        <div className="border-border my-12 border-t md:my-16" />

        {/* Comments */}
        <CommentSection comments={resolveComments()} />
      </div>
    </div>
  );
}
