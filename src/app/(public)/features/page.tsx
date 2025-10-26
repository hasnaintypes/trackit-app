"use client";

import { FeatureCards, ContentSection, Features } from "@component/features";

export default function FeaturesPage() {
  return (
    <section>
      <div>
        <Features />
        <ContentSection />
        <FeatureCards />
      </div>
    </section>
  );
}
