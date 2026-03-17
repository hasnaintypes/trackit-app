import Link from "next/link";
import Image from "next/image";

import { Badge } from "@ui/badge";
import { Button } from "@ui/button";

import { BlogPostCard, FeaturedPostSidebarItem } from "@component/blog";
import { blog } from "@content/site/blog";

export default function BlogPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 md:px-8 lg:px-12 lg:py-24">
      {/* Header */}
      <div className="mb-16 max-w-3xl">
        <p className="text-primary text-sm font-semibold tracking-widest uppercase">
          Blog
        </p>

        <h1 className="text-foreground mt-3 text-4xl leading-tight font-semibold md:text-5xl lg:text-6xl">
          Latest articles & insights
        </h1>

        <p className="text-muted-foreground mt-5 text-lg md:text-xl">
          Practical guides, product updates and design thinking to help you
          build better.
        </p>
      </div>

      {/* Featured Section */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Hero Featured Post */}
        <Link
          href={blog.featured.hero.href ?? "#"}
          className="group relative block h-[420px] overflow-hidden rounded-xl lg:col-span-2"
        >
          <Image
            src={blog.featured.hero.imageSrc}
            alt={blog.featured.hero.imageAlt}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized
          />

          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/30 to-transparent p-8 text-white">
            <Badge className="mb-3 w-fit bg-white/20 text-white backdrop-blur">
              {blog.featured.hero.badge}
            </Badge>

            <h2 className="text-2xl leading-tight font-bold md:text-3xl">
              {blog.featured.hero.title}
            </h2>
          </div>
        </Link>

        {/* Sidebar */}
        <div className="bg-card text-card-foreground h-fit space-y-6 rounded-xl border p-6 lg:sticky lg:top-24">
          <h3 className="text-xl font-semibold">Other featured posts</h3>

          <div className="space-y-6">
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

      {/* Recent Posts */}
      <div className="mt-24">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">Recent Posts</h2>

          <Button variant="outline" asChild>
            <Link href="#">All Posts</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blog.recentPosts.map((p) => (
            <BlogPostCard
              key={p.title}
              imageSrc={p.image ?? "/placeholder.svg"}
              imageAlt={p.imageAlt ?? p.title}
              title={p.title}
              description={p.excerpt ?? ""}
              authorName={p.author ?? "Anonymous"}
              authorAvatarSrc="/placeholder.svg"
              readTime={p.date ?? "3"}
              href={p.href}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
