"use client";

import React, { Suspense, useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { Skeleton } from "@ui/skeleton";
import { Palette, Layers } from "lucide-react";

const sectionFallback = <Skeleton className="h-96 w-full rounded-xl" />;

const CategoriesSettings = dynamic(
  () => import("@/components/pages/(protected)/settings/categories-settings"),
  { loading: () => sectionFallback },
);
const DisplaySettings = dynamic(
  () => import("@/components/pages/(protected)/settings/display-settings"),
  { loading: () => sectionFallback },
);

const sections = [
  { id: "appearance", label: "Appearance & Display", icon: Palette },
  { id: "categories", label: "Categories", icon: Layers },
] as const;

type SectionId = (typeof sections)[number]["id"];

export default function SettingsPageClient() {
  const [activeSection, setActiveSection] = useState<SectionId>("appearance");

  const handleSectionChange = useCallback((id: SectionId) => {
    setActiveSection(id);
  }, []);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full shrink-0 lg:w-64">
        <div className="bg-card rounded-xl border p-2 shadow-sm dark:border-white/10">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Content Area */}
      <div className="min-w-0 flex-1">
        <Suspense fallback={sectionFallback}>
          {activeSection === "appearance" && <DisplaySettings />}
          {activeSection === "categories" && <CategoriesSettings />}
        </Suspense>
      </div>
    </div>
  );
}
