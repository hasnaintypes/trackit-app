import React from "react";
import { stats } from "@content/site/about";

const StatsSection = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-(--breakpoint-xl) px-6 py-12 xl:px-0">
        <h2 className="text-4xl font-semibold tracking-tighter md:text-5xl">
          {stats.heading ?? "The perfect starting point for any project"}
        </h2>
        <div className="mt-16 grid justify-center gap-x-10 gap-y-16 sm:mt-24 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {stats.items.map((item) => (
            <div key={item.label}>
              <span className="text-5xl font-semibold tracking-tight md:text-6xl">
                {item.value}
              </span>
              <p className="mt-6 text-xl font-medium">{item.label}</p>
              {item.description ? (
                <p className="text-muted-foreground mt-2">{item.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
