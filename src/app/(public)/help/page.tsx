import { FAQ, ListItem } from "@component/help";
import help from "@content/site/help";

export default function Page() {
  return (
    <div>
      <div className="bg-muted relative">
        <div className="relative container mx-auto px-4 pt-24 pb-16 md:pt-32 md:pb-24">
          <div className="mb-16 text-center">
            <h1 className="mb-6 text-4xl leading-tight font-bold md:text-5xl">
              <span className="from-foreground to-foreground/80 bg-gradient-to-r bg-clip-text text-transparent">
                Help &
              </span>{" "}
              <span className="text-primary italic">Support</span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed text-balance">
              {help.hero?.description}
            </p>
          </div>

          <div className="mx-auto -mb-36 grid max-w-6xl gap-6 md:grid-cols-3">
            {help.cards.map((c) => (
              <ListItem
                key={c.title}
                title={c.title}
                description={c.description ?? ""}
                linkText={c.linkText}
                href={c.href}
              />
            ))}
          </div>
        </div>
      </div>

      <div id="faqs" className="bg-faq py-16 md:py-32">
        <div className="container mx-auto px-4">
          {/* Added hardcoded heading above FAQ section */}
          <div className="mb-12 text-center">
            <h2 className="text-foreground mb-4 text-2xl font-bold md:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground mx-auto max-w-3xl">
              {help.faqDescription ??
                "Get clear answers to common questions about our platform."}
            </p>
          </div>

          <FAQ items={help.faqItems} />
        </div>
      </div>
    </div>
  );
}
