import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@ui/accordion";
import { faq } from "@content/site/about";

const FAQSection = () => {
  return (
    <div className="flex w-full items-center justify-center px-6 py-8">
      <div className="flex flex-col items-start gap-x-12 gap-y-6 md:flex-row">
        <h2 className="text-4xl leading-[1.15]! font-semibold tracking-tighter lg:text-5xl">
          {faq.heading ?? "Frequently Asked Questions"}
        </h2>
        <Accordion type="single" defaultValue="question-0" className="max-w-xl">
          {faq.items.map(({ question, answer }, index) => (
            <AccordionItem key={question} value={`question-${index}`}>
              <AccordionTrigger className="cursor-pointer text-left text-lg">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQSection;
