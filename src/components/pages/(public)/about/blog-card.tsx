import { ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { blog as siteBlog } from "@content/site/blog";
import type { BlogCard as ContentBlogCard } from "@/types";

type LocalBlogCard = {
  img: string;
  alt: string;
  title: string;
  description: string;
  blogLink: string;
};

const normalizeSrc = (s?: string) => {
  if (!s) return "/blog-1.jpg";
  return s.startsWith("/") || s.startsWith("http") || s.startsWith("data:")
    ? s
    : `/${s}`;
};

const mapContentToLocal = (c: ContentBlogCard): LocalBlogCard => ({
  img: normalizeSrc(c.image),
  alt: c.title ?? "Blog image",
  title: c.title,
  description: c.excerpt ?? "",
  blogLink: c.href ?? "#",
});

const Blog = ({ blogCards }: { blogCards?: LocalBlogCard[] }) => {
  const cards = blogCards?.length
    ? blogCards
    : siteBlog.recentPosts.map((c) => mapContentToLocal(c));

  return (
    <section className="py-8 sm:py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 space-y-4 text-center sm:mb-16 lg:mb-24">
          <p className="text-primary text-sm font-medium uppercase">
            Blog list
          </p>
          <h2 className="text-2xl font-semibold md:text-3xl lg:text-4xl">
            Plan your upcoming journey.
          </h2>
          <p className="text-muted-foreground text-xl">
            Explore new destinations, indulge in local cuisines, and immerse
            yourself in diverse cultures.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((item, index) => (
            <Card
              className="pt-0 shadow-none max-lg:last:col-span-full"
              key={index}
            >
              <CardContent className="px-0">
                <div className="relative h-60 w-full overflow-hidden rounded-t-xl">
                  <Image
                    src={item.img}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
              </CardContent>
              <CardHeader className="mb-2 gap-3">
                <CardTitle className="text-xl">
                  <a href={item.blogLink}>{item.title}</a>
                </CardTitle>
                <CardDescription className="text-base">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  className="group rounded-lg text-base shadow-sm"
                  size="lg"
                  asChild
                >
                  <a
                    href={item.blogLink}
                    className="flex items-center gap-2 px-6"
                  >
                    <span>Read More</span>
                    <ArrowRightIcon className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
