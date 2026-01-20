"use client";

import { Button } from "@/components/ui/button";
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
    <aside className="border-border bg-card w-64 border-r p-6">
      <div className="mb-8">
        <h2 className="text-foreground text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your account and preferences
        </p>
      </div>

      <nav className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <Button
              key={section.id}
              variant={isActive ? "default" : "ghost"}
              className="w-full cursor-pointer justify-start gap-3"
              onClick={() => onSectionChange(section.id)}
            >
              <Icon className="h-4 w-4" />
              <span>{section.label}</span>
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
