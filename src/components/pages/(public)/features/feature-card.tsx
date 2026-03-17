import React from "react";
import {
  Building2,
  Lightbulb,
  ScreenShare,
  Trophy,
  User,
  User2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { featuresContent } from "@content/site/features";

// Define the feature item type used by this component
type FeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  position?: "left" | "right";
  cornerStyle?: string;
};

// Map content features to FeatureItem and keep icons local
const pickIconForTitle = (title: string): LucideIcon => {
  const key = title.toLowerCase();
  if (key.includes("taught") || key.includes("building")) return Building2;
  if (key.includes("hostel") || key.includes("user2")) return User2;
  if (key.includes("bount")) return Trophy;
  if (key.includes("revision") || key.includes("screen")) return ScreenShare;
  if (key.includes("peer") || key.includes("user")) return User;
  if (key.includes("leet") || key.includes("lab") || key.includes("light"))
    return Lightbulb;
  return Building2;
};

const leftFeatures: FeatureItem[] = featuresContent.leftFeatures.map((f) => ({
  icon: pickIconForTitle(f.title),
  title: f.title,
  description: f.description,
  position: f.position,
  cornerStyle: f.cornerStyle,
}));

const rightFeatures: FeatureItem[] = featuresContent.rightFeatures.map((f) => ({
  icon: pickIconForTitle(f.title),
  title: f.title,
  description: f.description,
  position: f.position,
  cornerStyle: f.cornerStyle,
}));

const FeatureCardInner = ({ feature }: { feature: FeatureItem }) => {
  const Icon = feature.icon;

  return (
    <div>
      <div
        className={cn(
          "relative rounded-2xl px-3 pt-3 pb-3 text-sm",
          "bg-secondary/50 ring-border ring",
          feature.cornerStyle,
        )}
      >
        <div className="text-primary mb-3 text-[2rem]">
          <Icon />
        </div>
        <h2 className="text-foreground mb-2.5 text-2xl">{feature.title}</h2>
        <p className="text-muted-foreground text-sm text-pretty">
          {feature.description}
        </p>
        {/* Decorative elements */}
        <span className="from-primary/0 via-primary to-primary/0 absolute -bottom-px left-1/2 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r opacity-60"></span>
        <span className="absolute inset-0 bg-[radial-gradient(30%_5%_at_50%_100%,hsl(var(--primary)/0.15)_0%,transparent_100%)] opacity-60"></span>
      </div>
    </div>
  );
};

const FeatureCard = React.memo(FeatureCardInner);

export default function FeatureCards() {
  return (
    <section className="pt-20 pb-8" id="features">
      <div className="mx-6 max-w-[1120px] pt-2 pb-16 max-[300px]:mx-4 min-[1150px]:mx-auto">
        <div className="flex flex-col-reverse gap-4 md:grid md:grid-cols-3 md:gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            {leftFeatures.map((feature, index) => (
              <FeatureCard key={`left-feature-${index}`} feature={feature} />
            ))}
          </div>

          {/* Center column */}
          <div className="order-[1] mb-4 self-center sm:order-[0] md:mb-0">
            <div className="bg-secondary text-foreground ring-border relative mx-auto mb-4.5 w-fit rounded-full rounded-bl-[2px] px-4 py-2 text-sm ring">
              <span className="relative z-1 flex items-center gap-2">
                Features
              </span>
              <span className="from-primary/0 via-primary to-primary/0 absolute -bottom-px left-1/2 h-px w-2/5 -translate-x-1/2 bg-gradient-to-r"></span>
              <span className="absolute inset-0 bg-[radial-gradient(30%_40%_at_50%_100%,hsl(var(--primary)/0.25)_0%,transparent_100%)]"></span>
            </div>
            <h2 className="text-foreground mb-2 text-center text-2xl sm:mb-2.5 md:text-[2rem]">
              Key Benefits of Cohorts
            </h2>
            <p className="text-muted-foreground mx-auto max-w-[18rem] text-center text-pretty">
              Cohorts are best way to learn because you finish the course in a
              timely manner
            </p>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {rightFeatures.map((feature, index) => (
              <FeatureCard key={`right-feature-${index}`} feature={feature} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
