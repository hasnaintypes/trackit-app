"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationPreference {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsSettings() {
  const [emailNotifications, setEmailNotifications] = useState<
    NotificationPreference[]
  >([
    {
      id: "trans",
      title: "Transaction Alerts",
      description: "Get notified for every transaction",
      enabled: true,
    },
    {
      id: "balance",
      title: "Low Balance Warnings",
      description: "Alert when balance falls below threshold",
      enabled: true,
    },
    {
      id: "security",
      title: "Security Notices",
      description: "Login alerts and security events",
      enabled: true,
    },
    {
      id: "marketing",
      title: "Marketing & Updates",
      description: "New features and platform updates",
      enabled: false,
    },
  ]);

  const [pushNotifications, setPushNotifications] = useState<
    NotificationPreference[]
  >([
    {
      id: "trans",
      title: "Transaction Alerts",
      description: "Push notifications for transactions",
      enabled: true,
    },
    {
      id: "balance",
      title: "Low Balance Warnings",
      description: "Push alert when balance is low",
      enabled: true,
    },
  ]);

  const [smsNotifications, setSmsNotifications] = useState<
    NotificationPreference[]
  >([
    {
      id: "large",
      title: "Large Transactions",
      description: "Alert for transactions over $5,000",
      enabled: true,
    },
    {
      id: "security",
      title: "Security Events",
      description: "Critical security notifications",
      enabled: true,
    },
  ]);

  const toggleNotification = (type: "email" | "push" | "sms", id: string) => {
    if (type === "email") {
      setEmailNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)),
      );
    } else if (type === "push") {
      setPushNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)),
      );
    } else {
      setSmsNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)),
      );
    }
  };

  const NotificationGroup = ({
    title,
    description,
    notifications,
    type,
  }: {
    title: string;
    description: string;
    notifications: NotificationPreference[];
    type: "email" | "push" | "sms";
  }) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="border-border flex items-center justify-between rounded-lg border p-3"
            >
              <div>
                <Label className="text-foreground font-medium">
                  {notification.title}
                </Label>
                <p className="text-muted-foreground text-sm">
                  {notification.description}
                </p>
              </div>
              <Switch
                checked={notification.enabled}
                onCheckedChange={() =>
                  toggleNotification(type, notification.id)
                }
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-1">
          Manage how you receive alerts and updates
        </p>
      </div>

      <NotificationGroup
        title="Email Notifications"
        description="Receive alerts via email"
        notifications={emailNotifications}
        type="email"
      />

      <NotificationGroup
        title="Push Notifications"
        description="Receive alerts on your device"
        notifications={pushNotifications}
        type="push"
      />

      <NotificationGroup
        title="SMS Notifications"
        description="Receive critical alerts via SMS"
        notifications={smsNotifications}
        type="sms"
      />
    </div>
  );
}
