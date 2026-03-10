"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  UserPen,
  Bell,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import EditProfileSection from "@/components/pages/(protected)/profile/edit-profile-section";
import NotificationsSection from "@/components/pages/(protected)/profile/notifications-section";
import SecuritySection from "@/components/pages/(protected)/profile/security-section";
import BillingSection from "@/components/pages/(protected)/profile/billing-section";

const sections = [
  { id: "edit-profile", label: "Edit profile", icon: UserPen },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Password & Security", icon: ShieldCheck },
  { id: "billing", label: "Choose plan", icon: CreditCard },
] as const;

type SectionId = (typeof sections)[number]["id"];

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState<SectionId>("edit-profile");

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
        {activeSection === "edit-profile" && <EditProfileSection />}
        {activeSection === "notifications" && <NotificationsSection />}
        {activeSection === "security" && <SecuritySection />}
        {activeSection === "billing" && <BillingSection />}
      </div>
    </div>
  );
}
