"use client";

import type React from "react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import useSessions from "@/hooks/use-sessions";
import { formatTimestamp } from "@/constants/formatting";
import { prettyDeviceFromUA } from "@/lib/device-map";
import { toast } from "sonner";
import { Card, CardContent } from "@ui/card";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Label } from "@ui/label";
import { Badge } from "@ui/badge";
import { LogOut, Smartphone } from "lucide-react";

export default function SecuritySection() {
  const { changePassword } = useAuth();
  const { sessions, revoke } = useSessions();
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    try {
      setIsChangingPassword(true);
      await changePassword(
        passwordForm.newPassword,
        passwordForm.currentPassword,
        true,
      );

      toast.success("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        `Failed to update password: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const activeSessions = (sessions ?? []).map((s) => ({
    id: s.id,
    device: prettyDeviceFromUA(s.device),
    ip: s.ip,
    lastActivity: s.lastActivity,
  }));

  const loginHistory = (sessions ?? []).map((s) => ({
    id: s.id,
    dateTime: formatTimestamp(s.lastActivity),
    ip: s.ip,
    status: "success" as const,
  }));

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-foreground mb-1 font-semibold">
            Change Password
          </h3>
          <p className="text-muted-foreground mb-4 text-xs">
            Update your password. You will be logged out of all other sessions.
          </p>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                placeholder="Enter your current password"
                required
                value={passwordForm.currentPassword}
                onChange={handlePasswordFormChange}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Enter a new password"
                  required
                  value={passwordForm.newPassword}
                  onChange={handlePasswordFormChange}
                />
                <p className="text-muted-foreground text-xs">
                  Minimum 8 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter the new password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordFormChange}
                />
              </div>
            </div>
            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-foreground mb-1 font-semibold">
            Active Sessions
          </h3>
          <p className="text-muted-foreground mb-4 text-xs">
            Devices currently logged into your account.
          </p>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start justify-between rounded-lg border p-3"
              >
                <div className="flex gap-3">
                  <Smartphone className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {session.device}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      IP: {session.ip} &middot; Last:{" "}
                      {formatTimestamp(session.lastActivity)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive h-8 gap-1.5 text-xs"
                  onClick={async () => {
                    try {
                      await revoke({ id: session.id });
                      toast.success("Session revoked");
                    } catch {
                      toast.error("Failed to revoke session");
                    }
                  }}
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Revoke
                </Button>
              </div>
            ))}
            {activeSessions.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No active sessions found.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-foreground mb-1 font-semibold">Login History</h3>
          <p className="text-muted-foreground mb-4 text-xs">
            Recent login attempts to your account.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    Date & Time
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    IP Address
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
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
                    <td className="px-3 py-2.5 text-xs">{login.dateTime}</td>
                    <td className="text-muted-foreground px-3 py-2.5 text-xs">
                      {login.ip}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        variant={
                          login.status === "success" ? "default" : "destructive"
                        }
                        className="text-[10px]"
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
