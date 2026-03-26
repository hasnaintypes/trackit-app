"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@ui/field";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }
    setLoading(true);
    const loadingToastId = toast.loading("Sending password reset email...");
    try {
      await requestPasswordReset(email, "/reset-password");
      setSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err: unknown) {
      let errorMsg = "Failed to send reset email.";
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
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Forgot your password?
          </h1>
          <p className="text-muted-foreground max-w-sm text-sm">
            {sent
              ? "We've sent a password reset link to your email. Check your inbox and follow the instructions."
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {!sent && (
          <FieldGroup className="space-y-6">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoComplete="email"
                placeholder="m@example.com"
                className="focus-visible:ring-ring transition-all focus-visible:ring-2"
              />
            </Field>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </FieldGroup>
        )}

        {sent && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setSent(false)}
          >
            Send again
          </Button>
        )}

        <FieldDescription className="text-muted-foreground text-center text-sm">
          Remember your password?{" "}
          <Link
            href="/sign-in"
            className="hover:text-primary underline underline-offset-4 transition-colors"
          >
            Sign in
          </Link>
        </FieldDescription>
      </form>
    </main>
  );
}
