import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface StepsIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepsIndicator({ steps, currentStep }: StepsIndicatorProps) {
  return (
    <div className="mx-auto mb-12 w-full max-w-4xl">
      <div className="relative flex w-full items-center justify-between">
        {/* Background Line */}
        <div className="bg-secondary absolute top-1/2 left-0 -z-10 h-0.5 w-full" />

        {/* Dynamic Progress Line */}
        <motion.div
          className="bg-primary absolute top-1/2 left-0 -z-10 h-0.5 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: (currentStep - 1) / (steps.length - 1) }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className="bg-background flex flex-col items-center gap-2 px-2"
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors duration-300",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary text-primary"
                      : "border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <div className="hidden flex-col items-center text-center sm:flex">
                <span
                  className={cn(
                    "text-xs font-semibold transition-colors duration-300",
                    isCurrent || isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
