"use client";

import { createLogger } from "@/lib/logging";
import { useSettings } from "@/hooks/use-settings";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { NotificationPreferences } from "@prisma/client";

const logger = createLogger("profile-notifications");

export default function NotificationsSection() {
  const { settings, isLoading, updateNotifications, isUpdating } =
    useSettings();

  if (isLoading || !settings) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[250px] w-full rounded-xl" />
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
      logger.error("Failed to update notification preferences");
    }
  };

  const NotificationRow = ({
    title,
    description,
    field,
  }: {
    title: string;
    description: string;
    field: keyof NotificationPreferences;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="pr-4">
        <p className="text-foreground text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <Switch
        checked={Boolean(prefs[field])}
        disabled={isUpdating}
        onCheckedChange={(checked) => handleToggle(field, checked)}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Reports & Insights */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-foreground mb-1 font-semibold">
            Reports & Insights
          </h3>
          <p className="text-muted-foreground mb-4 text-xs">
            Automated email digests and AI spending analysis.
          </p>
          <div className="divide-border divide-y">
            <NotificationRow
              field="emailAiInsights"
              title="AI Spending Insights"
              description="Personalized spending patterns sent every 3 days."
            />
            <NotificationRow
              field="emailWeeklyDigest"
              title="Weekly Summary Digest"
              description="Comprehensive wrap-up sent every Monday."
            />
            <NotificationRow
              field="emailMonthlySummary"
              title="Monthly Performance Report"
              description="Detailed monthly breakdown sent on the 1st."
            />
          </div>
        </CardContent>
      </Card>

      {/* Thresholds */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-foreground mb-1 font-semibold">
            Thresholds & Alerts
          </h3>
          <p className="text-muted-foreground mb-4 text-xs">
            Configure when to flag unusual activity or low balances.
          </p>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Large Transaction Threshold</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  className="bg-background border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={prefs.largeTransactionThreshold?.toString()}
                  onBlur={(e) =>
                    updateNotifications({
                      largeTransactionThreshold: parseFloat(e.target.value),
                    })
                  }
                  disabled={isUpdating}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Low Balance Warning</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">$</span>
                <input
                  type="number"
                  className="bg-background border-input ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1.5 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue={prefs.lowBalanceThreshold?.toString()}
                  onBlur={(e) =>
                    updateNotifications({
                      lowBalanceThreshold: parseFloat(e.target.value),
                    })
                  }
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="divide-border divide-y">
            <NotificationRow
              field="emailLargeTransactions"
              title="Large Transaction Emails"
              description="Immediate alert for suspicious/large purchases."
            />
            <NotificationRow
              field="emailLowBalanceAlerts"
              title="Low Balance Email Alerts"
              description="Notified when account balance hits your limit."
            />
          </div>
        </CardContent>
      </Card>

      {/* Personalized Alerts */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-foreground mb-1 font-semibold">
            Personalized Alerts
          </h3>
          <p className="text-muted-foreground mb-4 text-xs">
            Transactional notifications and budget threshold alerts.
          </p>
          <div className="divide-border divide-y">
            <NotificationRow
              field="emailBalanceAlerts"
              title="Budget Threshold Alerts"
              description="Notified at 70%, 90%, and 100% of your limits."
            />
            <NotificationRow
              field="emailTransactions"
              title="Recurring Payment Reminders"
              description="Alerts for upcoming bills 1 day before they are due."
            />
            <NotificationRow
              field="emailSecurity"
              title="Security Notices"
              description="Login notifications and system updates."
            />
            <NotificationRow
              field="emailMarketing"
              title="Marketing & Product Updates"
              description="New features, tips, and financial guides."
            />
          </div>
        </CardContent>
      </Card>

      {/* Push & SMS */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-foreground mb-1 font-semibold">Push & SMS</h3>
          <p className="text-muted-foreground mb-4 text-xs">
            Mobile notifications and text alerts.
          </p>
          <div className="divide-border divide-y">
            <NotificationRow
              field="pushTransactions"
              title="Mobile Push Notifications"
              description="Instant alerts on your mobile device."
            />
            <NotificationRow
              field="pushBalanceAlerts"
              title="Mobile Balance Alerts"
              description="Push notifications for low balances and budget limits."
            />
            <NotificationRow
              field="smsLargeTransactions"
              title="Large Transaction SMS"
              description="Text alerts for large transactions over threshold."
            />
            <NotificationRow
              field="smsSecurity"
              title="SMS Security Alerts"
              description="Emergency text alerts for security changes."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
