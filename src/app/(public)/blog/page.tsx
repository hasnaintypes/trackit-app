import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import { BlogPostCard, FeaturedPostSidebarItem } from "@component/blog";
import { blog } from "@content/site/blog";

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 pt-12 md:px-6 lg:px-8">
      <div className="mb-12 max-w-4xl">
        <p className="text-primary text-sm font-medium tracking-wide uppercase">
          Blog
        </p>

        <h1 className="text-foreground mt-3 text-4xl leading-tight font-semibold md:text-4xl">
          Latest articles & insights
        </h1>

        <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
          Practical guides, product updates and design thinking to help you
          build better.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Link
          href={blog.featured.hero.href ?? "#"}
          className="relative block h-[400px] overflow-hidden rounded-lg shadow-lg md:h-[500px] lg:col-span-2"
        >
          <Image
            src={blog.featured.hero.imageSrc}
            alt={blog.featured.hero.imageAlt}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
            <Badge className="mb-2 w-fit bg-white/20 text-white backdrop-blur-sm">
              {blog.featured.hero.badge}
            </Badge>
            <h2 className="text-2xl leading-tight font-bold md:text-3xl">
              {blog.featured.hero.title}
            </h2>
          </div>
        </Link>

        {/* Other Featured Posts Sidebar */}
        <div className="bg-card text-card-foreground space-y-6 rounded-lg border p-6 lg:col-span-1">
          <h3 className="text-xl font-semibold">Other featured posts</h3>
          <div className="space-y-5">
            {blog.featuredSidebar.map((item) => (
              <FeaturedPostSidebarItem
                key={item.title}
                imageSrc={item.image}
                imageAlt={item.imageAlt}
                title={item.title}
                href={item.href as string | undefined}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="mt-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Posts</h2>
          <Button variant="outline" asChild>
            <Link href="#">All Posts</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blog.recentPosts.map((p) => (
            <BlogPostCard
              key={p.title}
              imageSrc={p.image ?? "/placeholder.svg"}
              imageAlt={p.imageAlt ?? p.title}
              title={p.title}
              description={p.excerpt ?? ""}
              authorName={p.author ?? "Anonymous"}
              authorAvatarSrc={
                p.author ? "/placeholder.svg" : "/placeholder.svg"
              }
              readTime={p.date ?? "3"}
              href={p.href}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
