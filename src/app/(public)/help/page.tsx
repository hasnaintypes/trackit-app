import { FAQ, ListItem, Search } from "@component/help";
import help from "@content/site/help";

export default function Page() {
  return (
    <div>
      <div className="bg-muted relative">
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="mb-12 text-center">
            <h1 className="mb-6 text-4xl leading-tight font-bold md:text-5xl">
              {help.hero?.title}
            </h1>
            <p className="text-muted-foreground mx-auto max-w-3xl text-lg leading-relaxed text-balance">
              {help.hero?.description}
            </p>
          </div>

          {/* Added descriptive text above search */}
          <div className="mb-4 text-center">
            <p className="text-muted-foreground text-lg">
              Find quick answers or browse popular topics below.
            </p>
          </div>

          <div className="mb-16">
            <Search />
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
