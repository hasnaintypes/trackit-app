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
import { Eye, EyeOff } from "lucide-react";

interface TwoFactorDisableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function TwoFactorDisableDialog({
  open,
  onOpenChange,
  onComplete,
}: TwoFactorDisableDialogProps) {
  const { disableTwoFactor } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setPassword("");
    setShowPassword(false);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your password");
      return;
    }
    setLoading(true);
    try {
      await disableTwoFactor(password);
      toast.success("Two-factor authentication disabled");
      onComplete();
      onOpenChange(false);
      resetState();
    } catch {
      toast.error("Invalid password. Please try again.");
    } finally {
      setLoading(false);
    }
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
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              This will make your account less secure. You will no longer need a
              verification code to sign in.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">
              Disabling 2FA removes an important layer of security from your
              account. Only proceed if you are sure.
            </div>
            <div className="space-y-2">
              <Label htmlFor="disable-2fa-password">
                Confirm your password
              </Label>
              <div className="relative">
                <Input
                  id="disable-2fa-password"
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
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Disabling..." : "Disable 2FA"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
