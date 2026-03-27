"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
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
import { Copy, Download, Eye, EyeOff, Check } from "lucide-react";

type Step = "password" | "codes";

interface TwoFactorBackupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TwoFactorBackupDialog({
  open,
  onOpenChange,
}: TwoFactorBackupDialogProps) {
  const { generateBackupCodes } = useAuth();
  const [step, setStep] = useState<Step>("password");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const resetState = () => {
    setStep("password");
    setPassword("");
    setShowPassword(false);
    setLoading(false);
    setBackupCodes([]);
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
      const data = await generateBackupCodes(password);
      if (data?.backupCodes) {
        setBackupCodes(data.backupCodes);
      }
      setStep("codes");
      toast.success("New backup codes generated");
    } catch {
      toast.error("Invalid password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      setCopied(true);
      toast.success("Backup codes copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy codes");
    }
  };

  const handleDownload = () => {
    const content = [
      "Trackit - Two-Factor Authentication Backup Codes",
      "================================================",
      "",
      "Keep these codes in a safe place. Each code can only be used once.",
      "These codes replace any previously generated codes.",
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

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) resetState();
        onOpenChange(val);
      }}
    >
      <DialogContent>
        {step === "password" && (
          <form onSubmit={handlePasswordSubmit}>
            <DialogHeader>
              <DialogTitle>Regenerate Backup Codes</DialogTitle>
              <DialogDescription>
                This will invalidate your existing backup codes and generate new
                ones. Enter your password to continue.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="backup-password"
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
                onClick={() => {
                  onOpenChange(false);
                  resetState();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Generating..." : "Generate New Codes"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step === "codes" && (
          <>
            <DialogHeader>
              <DialogTitle>New Backup Codes</DialogTitle>
              <DialogDescription>
                Your previous backup codes have been invalidated. Save these new
                codes in a safe place.
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
                  onClick={handleCopy}
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
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button
                onClick={() => {
                  onOpenChange(false);
                  resetState();
                }}
              >
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
