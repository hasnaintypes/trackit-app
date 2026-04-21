import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react";

export type FeatureItem = {
  icon: ComponentType<Record<string, unknown>> | LucideIcon;
  title: string;
  description: string;
  cardBorderColor: string;
  avatarTextColor: string;
  avatarBgColor: string;
};

export type HeroContent = {
  badgeText?: string;
  title: string;
  description: string;
  primaryCta: { href: string; text: string };
  secondaryCta?: { text: string };
};

export type ContentSectionContent = {
  heading: string;
  paragraphs: string[];
  bullets: { title: string; body: string; icon?: string }[];
};

export type IntegrationContent = {
  heading: string;
  description: string;
  cta?: { href: string; text: string };
};

export type Plan = {
  name: string;
  price: number;
  description: string;
  features: string[];
  buttonText: string;
  isRecommended?: boolean;
  isPopular?: boolean;
};

export type Testimonial = {
  name: string;
  role: string;
  image: string;
  quote: string;
};

export type HomeContent = {
  featuresList: FeatureItem[];
  hero: HeroContent;
  contentSection: ContentSectionContent;
  integrations: IntegrationContent;
  pricing: { plans: Plan[] };
  testimonials: Testimonial[];
};

// About page types
export type AboutHero = {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
};

export type StatItem = {
  label: string;
  value: string | number;
  description?: string;
};

export type StatsSectionContent = {
  heading?: string;
  items: StatItem[];
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type FAQSectionContent = {
  heading?: string;
  items: FAQItem[];
};

export type BlogCard = {
  title: string;
  excerpt?: string;
  href?: string;
  image?: string;
  imageAlt?: string;
  author?: string;
  authorAvatarSrc?: string;
  readTime?: string;
  date?: string;
};

export type AboutContent = {
  hero: AboutHero;
  stats?: StatsSectionContent;
  faq?: FAQSectionContent;
  blogCards?: BlogCard[];
};

// Features page types
export type FeatureSectionItem = {
  title: string;
  description: string;
};

export type FeatureSection = {
  id: string;
  title: string;
  description: string;
  items: FeatureSectionItem[];
};

export type FeaturesContent = {
  heading: string;
  description: string;
  sections: FeatureSection[];
};

export type BlogPost = {
  // unique identifier for the post (used for id-based comment mapping)
  id?: string;
  category?: string;
  title: string;
  author: { name: string; avatar?: string };
  publishedDate?: string;
  content?: string[];
  coverImage?: string;
  href?: string;
  readTime?: string;
};

export type BlogContent = {
  blogCards?: BlogCard[];
  posts?: BlogPost[];
};

export type BlogComment = {
  id: string;
  author: { name: string; avatar?: string };
  content: string;
  timestamp: string;
  likes: number;
  // optional reference to the post id this comment belongs to
  postId?: string;
};

// Help page types
export type HelpCard = {
  title: string;
  description?: string;
  linkText: string;
  href: string;
};

export type HelpFAQItem = {
  id: string;
  question: string;
  answer: string;
};

export type HelpContent = {
  hero?: { title: string; description?: string };
  cards: HelpCard[];
  faqHeading?: string;
  faqDescription?: string;
  faqItems: HelpFAQItem[];
};

// Changelog types
export type ChangelogEntry = {
  date: string;
  version: string;
  badges?: string[];
  improvements?: string[];
  bugfixes?: string[];
  newFeatures?: string[];
  image?: { src: string; alt?: string; width?: number; height?: number };
};

export type ChangelogContent = {
  entries: ChangelogEntry[];
};
