import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import Image from "next/image";
import Link from "next/link";
import type { BlogCard } from "@/types/site";

function BlogPostCardInner({
  imageSrc,
  imageAlt,
  title,
  description,
  authorName,
  authorAvatarSrc,
  readTime,
  href,
}: BlogCard & {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  authorName: string;
  authorAvatarSrc: string;
  readTime: string;
  href?: string;
}) {
  const card = (
    <div className="bg-card text-card-foreground overflow-hidden rounded-lg border">
      <div className="relative h-48 w-full">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="grid gap-2 p-4">
        <h3 className="text-lg leading-tight font-semibold">{title}</h3>
        <p className="text-muted-foreground line-clamp-3 text-sm">
          {description}
        </p>
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Avatar className="h-6 w-6">
            <AvatarImage src={authorAvatarSrc || "/placeholder.svg"} />
            <AvatarFallback>
              {authorName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span>{authorName}</span>
          <span>·</span>
          <span>{readTime} read</span>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }

  return card;
}

export const BlogPostCard = React.memo(BlogPostCardInner);
