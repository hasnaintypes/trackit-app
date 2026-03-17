"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@ui/field";
import { toast } from "sonner";
import { LockKeyholeOpen } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing token.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const loadingToastId = toast.loading("Resetting password...");
    try {
      await resetPassword(token, newPassword);
      toast.success("Password reset successful! Redirecting to login...");
      setTimeout(() => router.push("/sign-in"), 2000);
    } catch (err: unknown) {
      let errorMsg = "Failed to reset password.";
      if (err && typeof err === "object" && "message" in err) {
        errorMsg = (err as { message?: string }).message ?? errorMsg;
      }
      toast.error(errorMsg);
    } finally {
      toast.dismiss(loadingToastId);
      setLoading(false);
    }
  };

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4">
      <form
        className="animate-in fade-in-50 flex w-full max-w-md flex-col gap-8 duration-500"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-primary/10 text-primary mb-2 rounded-full p-3">
            <LockKeyholeOpen className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="text-muted-foreground max-w-sm text-sm">
            Enter your new password below to regain access to your account.
          </p>
        </div>

        <FieldGroup className="space-y-6">
          <Field>
            <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              minLength={8}
              required
              disabled={loading}
              autoComplete="new-password"
              placeholder="********"
              className="focus-visible:ring-ring transition-all focus-visible:ring-2"
            />
          </Field>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </FieldGroup>

        <FieldDescription className="text-muted-foreground text-center text-sm">
          Remembered your password?{" "}
          <a
            href="/sign-in"
            className="hover:text-primary underline underline-offset-4 transition-colors"
          >
            Sign in
          </a>
        </FieldDescription>
      </form>
    </main>
  );
}
