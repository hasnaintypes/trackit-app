"use client";

import ProfileSettings from "@/components/pages/(protected)/settings/profile-settings";
import AccountSettings from "@/components/pages/(protected)/settings/account-settings";
import AppearanceSettings from "@/components/pages/(protected)/settings/appearance-settings";
import NotificationsSettings from "@/components/pages/(protected)/settings/notifications-settings";
import DisplaySettings from "@/components/pages/(protected)/settings/display-settings";
import SessionsSettings from "@/components/pages/(protected)/settings/sessions-settings";
import BillingSettings from "@/components/pages/(protected)/settings/billing-settings";
import CategoriesSettings from "@/components/pages/(protected)/settings/categories-settings";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
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

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Wallet },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "categories", label: "Categories", icon: Layers },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "display", label: "Display", icon: BarChart3 },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "sessions", label: "Sessions", icon: Shield },
] as const;

export default function SettingsPage() {
  return (
    <div className="bg-background min-h-screen w-full">
      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">
        <div className="mb-6">
          <h1 className="text-foreground text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your account and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6 flex h-auto w-full flex-wrap gap-1 bg-transparent p-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="bg-muted/50 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2 rounded-lg px-3 py-2 text-sm font-medium"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>
          <TabsContent value="account">
            <AccountSettings />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceSettings />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesSettings />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsSettings />
          </TabsContent>
          <TabsContent value="display">
            <DisplaySettings />
          </TabsContent>
          <TabsContent value="billing">
            <BillingSettings />
          </TabsContent>
          <TabsContent value="sessions">
            <SessionsSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
