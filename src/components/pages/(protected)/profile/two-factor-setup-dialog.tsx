"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ui/dialog";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Checkbox } from "@ui/checkbox";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@ui/input-otp";
import { Copy, Download, Eye, EyeOff, Check } from "lucide-react";

type Step = "password" | "qr" | "backup";

interface TwoFactorSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function TwoFactorSetupDialog({
  open,
  onOpenChange,
  onComplete,
}: TwoFactorSetupDialogProps) {
  const { enableTwoFactor, verifyTOTP } = useAuth();
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totpUri, setTotpUri] = useState("");
  const [secret, setSecret] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [savedCodes, setSavedCodes] = useState(false);
  const [copied, setCopied] = useState(false);

  const resetState = () => {
    setStep("password");
    setPassword("");
    setShowPassword(false);
    setLoading(false);
    setTotpUri("");
    setSecret("");
    setBackupCodes([]);
    setVerificationCode("");
    setSavedCodes(false);
    setCopied(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your password");
      return;
    }
    setLoading(true);
    try {
      const data = await enableTwoFactor(password);
      if (data?.totpURI) setTotpUri(data.totpURI);
      if (data?.backupCodes) setBackupCodes(data.backupCodes);
      // Extract secret from the URI
      const uriSecret = data?.totpURI
        ? new URL(data.totpURI).searchParams.get("secret")
        : null;
      if (uriSecret) setSecret(uriSecret);
      setStep("qr");
    } catch {
      toast.error("Invalid password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (value: string) => {
    if (value.length !== 6) return;
    setLoading(true);
    try {
      await verifyTOTP(value);
      toast.success("Two-factor authentication enabled");
      setStep("backup");
    } catch {
      toast.error("Invalid code. Please try again.");
      setVerificationCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBackupCodes = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      setCopied(true);
      toast.success("Backup codes copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy codes");
    }
  };

  const handleDownloadBackupCodes = () => {
    const content = [
      "Trackit - Two-Factor Authentication Backup Codes",
      "================================================",
      "",
      "Keep these codes in a safe place. Each code can only be used once.",
      "",
      ...backupCodes.map((code, i) => `${i + 1}. ${code}`),
      "",
      `Generated: ${new Date().toISOString()}`,
    ].join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trackit-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDone = () => {
    onComplete();
    onOpenChange(false);
    resetState();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetState();
        onOpenChange(val);
      }}
    >
      <DialogContent showCloseButton={step !== "backup"}>
        {step === "password" && (
          <form onSubmit={handlePasswordSubmit}>
            <DialogHeader>
              <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Enter your password to begin setting up 2FA.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="2fa-password">Password</Label>
                <div className="relative">
                  <Input
                    id="2fa-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 rounded p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Continue"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "qr" && (
          <>
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
              <DialogDescription>
                Scan this QR code with your authenticator app (Google
                Authenticator, Authy, etc.), then enter the 6-digit code to
                verify.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex flex-col items-center gap-4">
              {totpUri && (
                <div className="rounded-lg border bg-white p-4">
                  <QRCodeSVG value={totpUri} size={180} />
                </div>
              )}
              {secret && (
                <div className="w-full space-y-1">
                  <p className="text-muted-foreground text-xs">
                    Or enter this key manually:
                  </p>
                  <code className="bg-muted block rounded px-3 py-2 text-center font-mono text-sm tracking-wider break-all">
                    {secret}
                  </code>
                </div>
              )}
              <div className="w-full space-y-2">
                <Label>Verification Code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={(value) => {
                      setVerificationCode(value);
                      if (value.length === 6) {
                        void handleVerify(value);
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
                </div>
              </div>
              {loading && (
                <p className="text-muted-foreground text-sm">Verifying...</p>
              )}
            </div>
          </>
        )}

        {step === "backup" && (
          <>
            <DialogHeader>
              <DialogTitle>Save Your Backup Codes</DialogTitle>
              <DialogDescription>
                Store these codes in a safe place. If you lose access to your
                authenticator app, you can use one of these codes to sign in.
                Each code can only be used once.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, i) => (
                  <code
                    key={i}
                    className="bg-muted rounded px-3 py-2 text-center font-mono text-sm"
                  >
                    {code}
                  </code>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleCopyBackupCodes}
                >
                  {copied ? (
                    <Check className="mr-2 h-4 w-4" />
                  ) : (
                    <Copy className="mr-2 h-4 w-4" />
                  )}
                  {copied ? "Copied" : "Copy All"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleDownloadBackupCodes}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="savedCodes"
                  checked={savedCodes}
                  onCheckedChange={(checked) => setSavedCodes(checked === true)}
                />
                <Label htmlFor="savedCodes" className="text-sm font-normal">
                  I have saved these backup codes
                </Label>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button onClick={handleDone} disabled={!savedCodes}>
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
