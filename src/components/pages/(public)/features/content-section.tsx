import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { featuresContent } from "@content/site/features";

export default function ContentSection() {
  return (
    <section className="py-8 md:py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-6 md:grid-cols-2 md:gap-12">
          <h2 className="text-4xl font-medium">
            {featuresContent.teaser?.heading ?? featuresContent.heading}
          </h2>
          <div className="space-y-6">
            <p>
              {featuresContent.teaser?.subheading ?? featuresContent.subheading}
            </p>
            <p>
              <span className="font-bold">
                {featuresContent.teaser?.title ?? featuresContent.center?.title}
              </span>{" "}
              {featuresContent.teaser?.description ??
                featuresContent.center?.description}
            </p>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="gap-1 pr-1.5"
            >
              <Link href="/about">
                <span>Learn More</span>
                <ChevronRight className="size-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
