"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import AccountSettings from "@/components/pages/(protected)/settings/account-settings";
import AppearanceSettings from "@/components/pages/(protected)/settings/appearance-settings";
import DisplaySettings from "@/components/pages/(protected)/settings/display-settings";
import CategoriesSettings from "@/components/pages/(protected)/settings/categories-settings";
import { Wallet, Palette, BarChart3, Layers } from "lucide-react";

const sections = [
  { id: "account", label: "Account", icon: Wallet },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "categories", label: "Categories", icon: Layers },
  { id: "display", label: "Display", icon: BarChart3 },
] as const;

type SectionId = (typeof sections)[number]["id"];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("account");

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
                onClick={() => setActiveSection(section.id)}
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
        {activeSection === "account" && <AccountSettings />}
        {activeSection === "appearance" && <AppearanceSettings />}
        {activeSection === "categories" && <CategoriesSettings />}
        {activeSection === "display" && <DisplaySettings />}
      </div>
    </div>
  );
}
