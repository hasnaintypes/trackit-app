"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@ui/button";
import { Checkbox } from "@ui/checkbox";
import { Label } from "@ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@ui/input-otp";
import { ShieldCheck, KeyRound } from "lucide-react";

export default function TwoFactorPage() {
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const { verifyTOTP, verifyBackupCode } = useAuth();
  const router = useRouter();

  const handleVerifyTotp = async (value: string) => {
    if (value.length !== 6) return;
    setLoading(true);
    try {
      await verifyTOTP(value, trustDevice);
      toast.success("Verified successfully");
      router.push("/overview");
    } catch {
      toast.error("Invalid verification code. Please try again.");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupCode.trim()) {
      toast.error("Please enter a backup code");
      return;
    }
    setLoading(true);
    try {
      await verifyBackupCode(backupCode.trim(), trustDevice);
      toast.success("Verified successfully");
      router.push("/overview");
    } catch {
      toast.error("Invalid backup code. Please try again.");
      setBackupCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="animate-in fade-in-50 flex w-full max-w-md flex-col gap-8 duration-500">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-primary/10 text-primary mb-2 rounded-full p-3">
            {useBackup ? (
              <KeyRound className="h-6 w-6" />
            ) : (
              <ShieldCheck className="h-6 w-6" />
            )}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Two-Factor Authentication
          </h1>
          <p className="text-muted-foreground max-w-sm text-sm">
            {useBackup
              ? "Enter one of your backup codes to verify your identity."
              : "Enter the 6-digit code from your authenticator app."}
          </p>
        </div>

        {!useBackup ? (
          <div className="flex flex-col items-center gap-6">
            <InputOTP
              maxLength={6}
              value={code}
              onChange={(value) => {
                setCode(value);
                if (value.length === 6) {
                  void handleVerifyTotp(value);
                }
              }}
              disabled={loading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            {loading && (
              <p className="text-muted-foreground text-sm">Verifying...</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleVerifyBackup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backupCode">Backup Code</Label>
              <input
                id="backupCode"
                type="text"
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                placeholder="Enter your backup code"
                disabled={loading}
                className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                autoComplete="off"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Verifying..." : "Verify Backup Code"}
            </Button>
          </form>
        )}

        <div className="flex items-center gap-2">
          <Checkbox
            id="trustDevice"
            checked={trustDevice}
            onCheckedChange={(checked) => setTrustDevice(checked === true)}
          />
          <Label htmlFor="trustDevice" className="text-sm font-normal">
            Trust this device for 30 days
          </Label>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setUseBackup(!useBackup);
              setCode("");
              setBackupCode("");
            }}
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
          >
            {useBackup
              ? "Use authenticator app instead"
              : "Use a backup code instead"}
          </button>
          <Link
            href="/sign-in"
            className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 transition-colors hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
