"use client";

import { useSettings } from "@/hooks/use-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { NotificationPreferences } from "@prisma/client";

export default function NotificationsSettings() {
  const { settings, isLoading, updateNotifications, isUpdating } =
    useSettings();

  if (isLoading || !settings) {
    return (
      <div className="flex-1 space-y-6 p-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="space-y-4 pt-4">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[250px] w-full" />
        </div>
      </div>
    );
  }

  const prefs = settings.notifications;

  const handleToggle = async (
    field: keyof NotificationPreferences,
    value: boolean,
  ) => {
    try {
      await updateNotifications({ [field]: value });
    } catch {
      console.error("Failed to update notification preferences");
    }
  };

  const NotificationItem = ({
    title,
    description,
    field,
  }: {
    title: string;
    description: string;
    field: keyof NotificationPreferences;
  }) => (
    <div className="border-border flex items-center justify-between rounded-lg border p-3">
      <div>
        <Label className="text-foreground font-medium">{title}</Label>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Switch
        checked={Boolean(prefs[field])}
        disabled={isUpdating}
        onCheckedChange={(checked) => handleToggle(field, checked)}
      />
    </div>
  );

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Manage how you receive alerts and automated financial insights.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Analysis & Reports</CardTitle>
          <CardDescription>
            Control your automated email digests and AI spending patterns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationItem
            field="emailAiInsights"
            title="AI Spending Insights"
            description="Personalized spending patterns and highlights sent every 3 days."
          />
          <NotificationItem
            field="emailWeeklyDigest"
            title="Weekly Summary Digest"
            description="A comprehensive wrap-up of your gains and expenses sent every Monday."
          />
          <NotificationItem
            field="emailMonthlySummary"
            title="Monthly Performance Report"
            description="Detailed monthly breakdown and budget analysis sent on the 1st."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Financial Thresholds & Security</CardTitle>
          <CardDescription>
            Configure when the system should flag unusual activity or low
            balances.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Large Transaction Threshold</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <input
                  type="number"
                  className="bg-background border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={prefs.largeTransactionThreshold?.toString()}
                  onBlur={(e) =>
                    updateNotifications({
                      largeTransactionThreshold: parseFloat(e.target.value),
                    })
                  }
                  disabled={isUpdating}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Alert if a single purchase exceeds this amount.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Low Balance Warning</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <input
                  type="number"
                  className="bg-background border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={prefs.lowBalanceThreshold?.toString()}
                  onBlur={(e) =>
                    updateNotifications({
                      lowBalanceThreshold: parseFloat(e.target.value),
                    })
                  }
                  disabled={isUpdating}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                Alert if any account falls below this balance.
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <NotificationItem
              field="emailLargeTransactions"
              title="Large Transaction Emails"
              description="Receive an immediate email alert for suspicious/large purchases."
            />
            <NotificationItem
              field="emailLowBalanceAlerts"
              title="Low Balance Email Alerts"
              description="Get notified as soon as your account balance hits your limit."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Personalized Alerts</CardTitle>
          <CardDescription>
            Transactional notifications and manual budget threshold alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationItem
            field="emailBalanceAlerts"
            title="Budget Threshold Alerts"
            description="Get notified when you reach 70%, 90%, and 100% of your limits."
          />
          <NotificationItem
            field="emailTransactions"
            title="Recurring Payment Reminders"
            description="Alerts for upcoming bills and subscriptions 1 day before they are due."
          />
          <NotificationItem
            field="emailSecurity"
            title="Important Security Notices"
            description="Critical account alerts, login notifications, and system updates."
          />
          <NotificationItem
            field="emailMarketing"
            title="Marketing & Product Updates"
            description="Stay informed about new features, tips, and financial guides."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Push & SMS (Legacy)</CardTitle>
          <CardDescription>
            Configure device-specific mobile notifications and text alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationItem
            field="pushTransactions"
            title="Mobile Push Notifications"
            description="Receive instant alerts on your mobile device."
          />
          <NotificationItem
            field="pushBalanceAlerts"
            title="Mobile Balance Alerts"
            description="Push notifications for low balances and budget limits."
          />
          <NotificationItem
            field="smsLargeTransactions"
            title="Large Transaction SMS"
            description="Text alerts for suspicious or large transactions over your threshold."
          />
          <NotificationItem
            field="smsSecurity"
            title="SMS Security Alerts"
            description="Emergency text alerts for account logins and security changes."
          />
        </CardContent>
      </Card>
    </div>
  );
}
