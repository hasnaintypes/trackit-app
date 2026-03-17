import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { CircleCheck } from "lucide-react";
import type { Plan } from "@/types/site";
import { pricing as pricingContent } from "@content/site/home";

const plans: Plan[] = pricingContent.plans;
const PricingSectionInner = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <h1 className="text-center text-5xl font-semibold tracking-tighter">
        Pricing
      </h1>
      <div className="mx-auto mt-12 grid max-w-(--breakpoint-lg) grid-cols-1 items-center gap-10 sm:mt-16 lg:grid-cols-3 lg:gap-0">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "relative rounded-xl border p-7 lg:rounded-none lg:first:rounded-l-xl lg:last:rounded-r-xl",
              {
                "border-primary rounded-xl! border-2 py-12": plan.isPopular,
              },
            )}
          >
            {plan.isPopular && (
              <Badge className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                Most Popular
              </Badge>
            )}
            <h3 className="text-lg font-medium">{plan.name}</h3>
            <p className="mt-2 text-4xl font-bold">${plan.price}</p>
            <p className="text-muted-foreground mt-4 font-medium">
              {plan.description}
            </p>
            <Separator className="my-6" />
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <CircleCheck className="mt-1 h-4 w-4 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              variant={plan.isPopular ? "default" : "outline"}
              size="lg"
              className="mt-6 w-full cursor-pointer"
            >
              {plan.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

const PricingSection = React.memo(PricingSectionInner);
export default PricingSection;
