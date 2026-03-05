import { HeroSection, FAQSection, Blog, StatsSection } from "@component/about";

const AboutPage = () => {
  return (
    <section className="bg-transparent px-4 py-20 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <HeroSection />
        <StatsSection />
        <Blog />
        <FAQSection />
      </div>
    </section>
  );
};

export default AboutPage;
