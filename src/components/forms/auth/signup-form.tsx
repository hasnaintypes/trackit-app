"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@ui/button";
import { Eye, EyeOff } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@ui/field";
import { Input } from "@ui/input";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAvatarUrl } from "@shared/avatar";
import { signupSchema } from "@/validation/auth";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    try {
      const savedShowPassword =
        localStorage.getItem("showPassword_signup") === "1";
      const savedShowConfirm =
        localStorage.getItem("showConfirm_signup") === "1";
      setShowPassword(savedShowPassword);
      setShowConfirm(savedShowConfirm);
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("showPassword_signup", showPassword ? "1" : "0");
    } catch {}
  }, [showPassword]);

  useEffect(() => {
    try {
      localStorage.setItem("showConfirm_signup", showConfirm ? "1" : "0");
    } catch {}
  }, [showConfirm]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validation = signupSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });
    if (!validation.success) {
      toast.error(validation.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setLoading(true);
    const loadingToastId = toast.loading("Creating account...");
    try {
      const defaultAvatar = getAvatarUrl({});

      await signUp({
        name,
        email,
        password,
        image: defaultAvatar,
        callbackURL: "/onboarding",
      });
      toast.success("Account created! Please check your email to verify.");
      router.push("/sign-in");
    } catch (err) {
      const errorMsg =
        typeof err === "object" && err && "message" in err
          ? ((err as { message?: string }).message ?? "Sign up failed")
          : "Sign up failed";
      toast.error(errorMsg);
    } finally {
      toast.dismiss(loadingToastId);
      setLoading(false);
    }
  };

  return (
    <form
      className={cn("flex flex-col", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <FieldGroup>
        <div className="flex flex-col items-center text-center">
          <h1 className="text-xl font-semibold">Create your account</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Fill in the form below to create your account
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
        </Field>
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
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
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
          <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="pr-10"
            />
            <button
              type="button"
              aria-label={
                showConfirm ? "Hide confirm password" : "Show confirm password"
              }
              onClick={() => setShowConfirm((s) => !s)}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/60 absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 focus:outline-none focus-visible:ring-2"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </Field>
        <Field>
          <Button type="submit" disabled={loading} className="cursor-pointer">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </Field>
        <FieldSeparator>Or continue with</FieldSeparator>
        <Field>
          <Button
            variant="outline"
            type="button"
            disabled={loading}
            onClick={() => signInWithGoogle("/onboarding")}
            className="hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
          <FieldDescription className="px-2 text-center text-sm">
            Already have an account? <a href="/sign-in">Sign in</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
