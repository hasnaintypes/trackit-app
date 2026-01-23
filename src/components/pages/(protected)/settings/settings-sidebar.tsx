"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Assuming you have this util from shadcn, otherwise remove cn usage
import {
  User,
  Wallet,
  Palette,
  Bell,
  BarChart3,
  CreditCard,
  Shield,
  Layers,
} from "lucide-react";

type SettingSection =
  | "profile"
  | "account"
  | "appearance"
  | "notifications"
  | "display"
  | "billing"
  | "sessions"
  | "categories";

interface SettingsSidebarProps {
  activeSection: SettingSection;
  onSectionChange: (section: SettingSection) => void;
}

const sections = [
  { id: "profile" as const, label: "Profile", icon: User },
  { id: "account" as const, label: "Account", icon: Wallet },
  { id: "appearance" as const, label: "Appearance", icon: Palette },
  { id: "categories" as const, label: "Categories", icon: Layers },
  { id: "notifications" as const, label: "Notifications", icon: Bell },
  { id: "display" as const, label: "Display", icon: BarChart3 },
  { id: "billing" as const, label: "Billing", icon: CreditCard },
  { id: "sessions" as const, label: "Sessions", icon: Shield },
];

export default function SettingsSidebar({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) {
  return (
    <aside className="bg-card border-border flex w-full flex-col border-b md:w-64 md:border-r md:border-b-0">
      {/* Header - Hidden on very small screens to save space, or styled differently */}
      <div className="p-4 pb-2 md:p-6 md:pb-8">
        <h2 className="text-foreground text-xl font-bold md:text-2xl">
          Settings
        </h2>
        <p className="text-muted-foreground mt-1 hidden text-sm md:block">
          Manage your account and preferences
        </p>
      </div>

      {/* Navigation - Horizontal scroll on mobile, Vertical list on Desktop */}
      <nav className="flex gap-2 overflow-x-auto px-4 pb-4 md:flex-col md:space-y-1 md:overflow-visible md:px-6 md:pb-6">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <Button
              key={section.id}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "justify-start gap-3 whitespace-nowrap",
                isActive ? "bg-secondary text-secondary-foreground" : "",
                // Mobile specific styles: Compact, auto width
                "h-10 px-4 md:h-10 md:w-full",
              )}
              onClick={() => onSectionChange(section.id)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">{section.label}</span>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
