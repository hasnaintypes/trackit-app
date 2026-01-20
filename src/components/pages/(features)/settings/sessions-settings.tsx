"use client";

import { useState } from "react";
import { toast } from "sonner";
import useSessions from "@/hooks/use-sessions";
import { formatTimestamp } from "@/lib/format-options";
import { prettyDeviceFromUA } from "@/lib/device-map";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, Smartphone } from "lucide-react";

interface ActiveSession {
  id: string;
  device: string;
  ip: string;
  lastActivity: string;
}

interface LoginHistory {
  id: string;
  dateTime: string;
  ip: string;
  status: "success" | "failure";
}

export default function SessionsSettings() {
  const { sessions, revoke } = useSessions();

  // map sessions (from API) to the UI expected shape; fall back to static examples
  const activeSessions: ActiveSession[] = sessions?.length
    ? sessions.map((s) => ({
        id: s.id,
        device: prettyDeviceFromUA(s.device),
        ip: s.ip,
        lastActivity: s.lastActivity,
      }))
    : [
        {
          id: "1",
          device: "Chrome on MacOS",
          ip: "192.168.1.1",
          // use ISO timestamps for fallbacks so Date parsing works
          lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        },
        {
          id: "2",
          device: "Safari on iPhone",
          ip: "192.168.1.2",
          lastActivity: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        },
      ];

  // For now derive a simple login history from active sessions (success-only).
  // TODO: Implement a dedicated LoginHistory model to record all auth attempts
  // (including failures) and wire it into the auth flow. For now we show
  // successful session creation timestamps only.
  const loginHistory: LoginHistory[] = sessions?.length
    ? sessions.map((s) => ({
        id: s.id,
        dateTime: formatTimestamp(s.lastActivity),
        ip: s.ip,
        status: "success",
      }))
    : [
        {
          id: "1",
          dateTime: "Nov 1, 2025 at 2:30 PM",
          ip: "192.168.1.1",
          status: "success",
        },
        {
          id: "2",
          dateTime: "Oct 31, 2025 at 9:15 AM",
          ip: "192.168.1.2",
          status: "success",
        },
      ];

  const [twoFAEnabled, setTwoFAEnabled] = useState(true);

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold">Sessions</h1>
        <p className="text-muted-foreground mt-1">
          Manage your active sessions and security settings
        </p>
      </div>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Enhance your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-border flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="text-foreground font-medium">
                Two-Factor Authentication
              </Label>
              <p className="text-muted-foreground mt-1 text-sm">
                {twoFAEnabled ? "Enabled via Authenticator App" : "Not enabled"}
              </p>
            </div>
            <Switch checked={twoFAEnabled} onCheckedChange={setTwoFAEnabled} />
          </div>
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => toast.info("Two-Factor Authentication coming soon")}
          >
            Setup/Manage 2FA
          </Button>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            Devices currently logged into your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="border-border flex items-start justify-between rounded-lg border p-4"
              >
                <div className="flex gap-3">
                  <Smartphone className="text-muted-foreground mt-1 h-5 w-5" />
                  <div>
                    <p className="text-foreground font-medium">
                      {session.device}
                    </p>
                    {/* <p className="text-muted-foreground text-sm">
                      {session.location}
                    </p> */}
                    <p className="text-muted-foreground text-xs">
                      IP: {session.ip} • Last activity:{" "}
                      {formatTimestamp(session.lastActivity)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive gap-2"
                  onClick={async () => {
                    try {
                      await revoke({ id: session.id });
                      toast.success("Session revoked");
                    } catch {
                      toast.error("Failed to revoke session");
                    }
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle>Login History</CardTitle>
          <CardDescription>
            Recent login attempts to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-foreground px-4 py-2 text-left text-sm font-medium">
                    Date & Time
                  </th>
                  <th className="text-foreground px-4 py-2 text-left text-sm font-medium">
                    IP Address
                  </th>
                  <th className="text-foreground px-4 py-2 text-left text-sm font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {loginHistory.map((login) => (
                  <tr
                    key={login.id}
                    className="border-border border-b last:border-0"
                  >
                    <td className="text-foreground px-4 py-3 text-sm">
                      {login.dateTime}
                    </td>
                    <td className="text-foreground px-4 py-3 text-sm">
                      {login.ip}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge
                        variant={
                          login.status === "success" ? "default" : "destructive"
                        }
                      >
                        {login.status.charAt(0).toUpperCase() +
                          login.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
