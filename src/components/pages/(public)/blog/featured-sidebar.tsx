import Image from "next/image";
import Link from "next/link";
import type { BlogCard } from "@/types/site";

export function FeaturedPostSidebarItem({
  imageSrc,
  imageAlt,
  title,
  href,
}: BlogCard & {
  imageSrc?: string;
  imageAlt?: string;
  title: string;
  href?: string;
}) {
  const content = (
    <div className="hover:bg-blog-hover block rounded-lg px-2 py-1 transition-colors">
      <div className="flex items-center gap-3">
        <Image
          src={imageSrc ?? "/placeholder.svg"}
          alt={imageAlt ?? title}
          width={48}
          height={48}
          className="aspect-square rounded-md object-cover"
          unoptimized
        />
        <h4 className="text-sm leading-snug font-medium">{title}</h4>
      </div>
    </div>
  );

  if (href)
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );

  return content;
}
