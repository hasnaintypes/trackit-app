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
    <div className="bg-background flex min-h-screen">
      <SettingsSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <main className="flex-1">{renderContent()}</main>
    </div>
  );
}
