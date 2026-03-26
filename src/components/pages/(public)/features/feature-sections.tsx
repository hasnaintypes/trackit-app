import {
  LayoutDashboard,
  Brain,
  Users,
  FileBarChart,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { featuresContent } from "@content/site/features";

const sectionIcons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  budgets: Brain,
  splits: Users,
  reports: FileBarChart,
  settings: Shield,
};

export default function FeatureSections() {
  return (
    <div>
      {/* Hero */}
      <section className="pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="mx-auto flex max-w-6xl justify-between gap-16 px-6">
          <div className="max-w-2xl">
            <h1 className="text-4xl leading-tight font-bold md:text-5xl md:leading-tight">
              <span className="from-foreground to-foreground/80 bg-gradient-to-r bg-clip-text text-transparent">
                Features of
              </span>{" "}
              <span className="text-primary italic">Trackit</span>
              <br />
              <span className="from-foreground to-foreground/80 bg-gradient-to-r bg-clip-text text-transparent">
                personal finance
              </span>
            </h1>
            <div className="text-muted-foreground mt-8 max-w-xl space-y-4 text-base leading-relaxed">
              {featuresContent.description.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <nav className="hidden shrink-0 md:block">
            <div className="border-primary/30 border-l-2 pl-5">
              <span className="text-primary mb-5 block text-[11px] font-bold tracking-[0.15em] uppercase">
                Learn more about
              </span>
              <ul className="space-y-3.5">
                {featuresContent.sections.map((s) => (
                  <li key={s.id}>
                    <Link
                      href={`#${s.id}`}
                      className="text-muted-foreground hover:text-primary text-sm transition-colors"
                    >
                      {s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
      </section>

      {/* Feature Sections */}
      {featuresContent.sections.map((section) => {
        const Icon = sectionIcons[section.id] ?? LayoutDashboard;
        return (
          <section key={section.id} id={section.id} className="py-16 md:py-20">
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
                {/* Left: section info */}
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <Icon
                      className="text-primary size-7 shrink-0"
                      strokeWidth={1.5}
                    />
                    <h2 className="text-foreground text-3xl font-bold whitespace-nowrap">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>
                </div>

                {/* Right: feature grid */}
                <div className="grid gap-x-14 gap-y-10 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <div key={item.title}>
                      <h3 className="text-foreground mb-2 font-semibold">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
