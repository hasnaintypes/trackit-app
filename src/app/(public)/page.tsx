import {
  HeroSection,
  FeaturesSection,
  ContentSection,
  PricingSection,
  WallOfLoveSection,
  IntegrationsSection,
} from "@component/home";
import { featuresList as importedFeaturesList } from "@content/site/home";
import type { FeatureItem } from "@/types";

const featuresList: FeatureItem[] = importedFeaturesList;

export default function Home() {
  return (
    <>
      <HeroSection />
      <ContentSection />
      <FeaturesSection featuresList={featuresList} />
      <IntegrationsSection />
      <PricingSection />
      <WallOfLoveSection />
    </>
  );
}
