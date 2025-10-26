"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(() => {
    try {
      return (
        typeof window !== "undefined" &&
        localStorage.getItem("showPassword_login") === "1"
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("showPassword_login", showPassword ? "1" : "0");
    } catch {}
  }, [showPassword]);

  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const { signIn, requestPasswordReset } = useAuth();

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email above first.");
      return;
    }
    const loadingToastId = toast.loading("Sending password reset email...");
    try {
      await requestPasswordReset(email, "/reset-password");
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err) {
      let errorMsg = "Failed to send reset email.";
      if (err && typeof err === "object" && "message" in err) {
        errorMsg = (err as { message?: string }).message ?? errorMsg;
      }
      toast.error(errorMsg);
    } finally {
      toast.dismiss(loadingToastId);
    }
  };
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password required");
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading("Logging in...");
    try {
      await signIn({
        email,
        password,
        rememberMe,
        callbackURL: "/",
      });
      toast.success("Logged in successfully");
      router.push("/dashboard");
    } catch (err) {
      let errorMsg = "Login failed";
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
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-muted-foreground text-sm">
            Enter your email below to login to your account
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <button
              type="button"
              className="ml-auto text-sm underline-offset-4 hover:underline"
              onClick={handleForgotPassword}
              tabIndex={0}
              aria-label="Forgot your password?"
            >
              Forgot your password?
            </button>
          </div>
          <div className="relative w-full">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              className="pr-10"
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((s) => !s)}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/60 absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 focus:outline-none focus-visible:ring-2"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>

        <Field>
          <label
            htmlFor="rememberMe"
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <input
              id="rememberMe"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            Remember me
          </label>
        </Field>

        <Field>
          <Button type="submit" disabled={loading} className="cursor-pointer">
            {loading ? "Logging in..." : "Login"}
          </Button>
        </Field>

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field>
          <Button
            variant="outline"
            type="button"
            disabled={loading}
            onClick={() => toast.info("GitHub login coming soon!")}
            className="hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                fill="currentColor"
              />
            </svg>
            Login with GitHub
          </Button>
          <FieldDescription className="text-center">
            Don&apos;t have an account?{" "}
            <Link href="/sign-up" className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
