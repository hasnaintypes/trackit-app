import { Cpu, Zap } from "lucide-react";
import Image from "next/image";
import { contentSection as rawContentSection } from "@content/site/home";
import type { ContentSectionContent } from "@/types/site";

const contentSection: ContentSectionContent =
  rawContentSection as unknown as ContentSectionContent;

export default function ContentSection() {
  return (
    <section className="py-16 md:py-32">
      <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <h2 className="relative z-10 max-w-xl text-4xl font-medium lg:text-5xl">
          {contentSection.heading}
        </h2>
        <div className="relative">
          <div className="relative z-10 space-y-4 md:w-1/2">
            {contentSection.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            <div className="grid grid-cols-2 gap-3 pt-6 sm:gap-4">
              {contentSection.bullets.map((b, idx) => (
                <div className="space-y-3" key={idx}>
                  <div className="flex items-center gap-2">
                    {/* icons aren't provided in content, keep existing icons based on index */}
                    {idx === 0 ? (
                      <Zap className="size-4" />
                    ) : (
                      <Cpu className="size-4" />
                    )}
                    <h3 className="text-sm font-medium">{b.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-12 h-fit md:absolute md:inset-x-0 md:-inset-y-12 md:mt-0 md:mask-l-from-35% md:mask-l-to-55%">
            <div className="border-border/50 relative rounded-2xl border border-dotted p-2">
              <Image
                src="/charts.webp"
                className="hidden rounded-[12px] dark:block"
                alt="payments illustration dark"
                width={1207}
                height={929}
              />
              <Image
                src="/charts-light.webp"
                className="rounded-[12px] shadow dark:hidden"
                alt="payments illustration light"
                width={1207}
                height={929}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
