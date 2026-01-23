"use client";

import { useState } from "react";
import SettingsSidebar from "@/components/pages/(protected)/settings/settings-sidebar";
import ProfileSettings from "@/components/pages/(protected)/settings/profile-settings";
import AccountSettings from "@/components/pages/(protected)/settings/account-settings";
import AppearanceSettings from "@/components/pages/(protected)/settings/appearance-settings";
import NotificationsSettings from "@/components/pages/(protected)/settings/notifications-settings";
import DisplaySettings from "@/components/pages/(protected)/settings/display-settings";
import SessionsSettings from "@/components/pages/(protected)/settings/sessions-settings";
import BillingSettings from "@/components/pages/(protected)/settings/billing-settings";
import CategoriesSettings from "@/components/pages/(protected)/settings/categories-settings";

export type SettingSection =
  | "profile"
  | "account"
  | "appearance"
  | "notifications"
  | "display"
  | "billing"
  | "sessions"
  | "categories";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingSection>("profile");

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSettings />;
      case "account":
        return <AccountSettings />;
      case "appearance":
        return <AppearanceSettings />;
      case "notifications":
        return <NotificationsSettings />;
      case "display":
        return <DisplaySettings />;
      case "categories":
        return <CategoriesSettings />;
      case "billing":
        return <BillingSettings />;
      case "sessions":
        return <SessionsSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    // Changed: flex-col for mobile, md:flex-row for tablet/desktop
    <div className="bg-background flex min-h-screen w-full flex-col md:flex-row">
      {/* Sidebar Component */}
      <SettingsSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
        {/* Optional: Add a max-width container to prevent content from stretching too wide on 4k screens */}
        <div className="mx-auto max-w-4xl space-y-6">{renderContent()}</div>
      </main>
    </div>
  );
}
