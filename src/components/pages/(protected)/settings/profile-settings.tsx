"use client";

import type React from "react";
import type {
  Gender,
  Country,
  Timezone,
  UpdateProfileInput,
  User as UserType,
} from "@/types/user";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import {
  GenderOptions,
  CountryOptions,
  TimezoneOptions,
} from "@/lib/format-options";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Lock,
  Globe,
  Clock,
  MapPin,
  CheckCircle,
  User,
} from "lucide-react";

import Image from "next/image";

interface FormData {
  fullName: string;
  email: string;
  gender: Gender | null;
  country: Country | null;
  timezone: Timezone | null;
}

export default function ProfileSettings() {
  const { changePassword } = useAuth();
  const { user, isLoading, updateProfile, uploadFile } = useUser();
  const [loadingState, setLoadingState] = useState({
    isChangingPassword: false,
    isUploadingImage: false,
    isUpdatingProfile: false,
  });

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    // sensible UI defaults so selects are populated
    gender: "OTHER" as Gender,
    country: "US" as Country,
    timezone: "UTC" as Timezone,
  });

  useEffect(() => {
    const storeUser = useUserStore.getState().user;
    const activeUser = user ?? storeUser;

    if (activeUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: activeUser.name ?? "",
        email: activeUser.email ?? "",
        // preserve previous value when activeUser.gender is null/undefined
        gender: activeUser.gender ?? prev.gender,
        country: activeUser.country ?? prev.country,
        timezone: activeUser.timezone ?? prev.timezone,
      }));
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoadingState((prev) => ({ ...prev, isUploadingImage: true }));
      await uploadFile(file, {
        fileName: `profile-${Date.now()}`,
        folder: "Trackit-Uploads/Profiles",
      });
      toast.success("Profile picture updated successfully");
    } catch (error) {
      toast.error(
        "Failed to upload profile picture: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, isUploadingImage: false }));
    }
  };

  const setStoreUser = useUserStore((state) => state.setUser);

  const handleUpdateProfile = async () => {
    try {
      setLoadingState((prev) => ({ ...prev, isUpdatingProfile: true }));

      const updateData: UpdateProfileInput = {
        name: formData.fullName,
        ...(formData.gender != null && { gender: formData.gender }),
        country: formData.country ?? undefined,
        timezone: formData.timezone ?? undefined,
      };

      // Update profile via tRPC
      const updatedUser = await updateProfile(updateData);

      // Update Zustand store with the new user data
      if (updatedUser) {
        // Map API-shaped user (dates as strings) to the app `User` type (Date objects)
        const api = updatedUser as unknown as Record<string, unknown>;
        const idVal = api.id;
        const createdVal = api.createdAt;
        const updatedVal = api.updatedAt;
        const banExpiresVal = api.banExpires;

        const mappedUser: UserType = {
          id:
            typeof idVal === "string" || typeof idVal === "number"
              ? String(idVal)
              : "",
          name: (api.name as string) ?? "",
          email: (api.email as string) ?? "",
          emailVerified: Boolean(api.emailVerified ?? false),
          image: (api.image as string) ?? "",
          gender: (api.gender as Gender) ?? null,
          country: (api.country as Country) ?? null,
          timezone: (api.timezone as Timezone) ?? null,
          banned: Boolean(api.banned ?? false),
          banReason: (api.banReason as string) ?? null,
          banExpires:
            typeof banExpiresVal === "string" ||
            typeof banExpiresVal === "number"
              ? new Date(String(banExpiresVal))
              : null,
          role: (api.role as string) ?? "user",
          hasCompletedOnboarding: Boolean(api.hasCompletedOnboarding ?? false),
          createdAt:
            typeof createdVal === "string" || typeof createdVal === "number"
              ? new Date(String(createdVal))
              : new Date(),
          updatedAt:
            typeof updatedVal === "string" || typeof updatedVal === "number"
              ? new Date(String(updatedVal))
              : new Date(),
        };

        setStoreUser(mappedUser);
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        "Failed to update profile: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setLoadingState((prev) => ({ ...prev, isUpdatingProfile: false }));
    }
  };

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      setLoadingState((prev) => ({ ...prev, isChangingPassword: true }));
      await changePassword(
        passwordForm.newPassword,
        passwordForm.currentPassword,
        true, // Revoke other sessions for security
      );

      toast.success("Password updated successfully");

      // Reset form
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
      setLoadingState((prev) => ({ ...prev, isChangingPassword: false }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = <K extends "gender" | "country" | "timezone">(
    name: K,
    value: string,
  ) => {
    setFormData(
      (prev) => ({ ...prev, [name]: value as FormData[K] }) as FormData,
    );
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">
          This is how others will see you on the platform.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Upload a clear image for your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="bg-muted flex h-24 w-24 items-center justify-center overflow-hidden rounded-full">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "Profile"}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-muted-foreground text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="gap-2 bg-transparent"
                onClick={() => document.getElementById("profileImage")?.click()}
                disabled={loadingState.isUploadingImage}
              >
                <Upload className="h-4 w-4" />
                {loadingState.isUploadingImage
                  ? "Uploading..."
                  : "Upload Image"}
              </Button>
              <input
                type="file"
                id="profileImage"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
              <p className="text-muted-foreground text-xs">
                Recommended: Square image, at least 200x200px
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="text-primary h-5 w-5" />
            User Details {isLoading && "(Loading...)"}
          </CardTitle>
          <CardDescription>
            Update your basic profile information and view your account status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder={isLoading ? "Loading..." : "Enter your full name"}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender ?? undefined}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select your gender" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GenderOptions).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Email Section with Verification Status */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="bg-muted w-full"
                />
              </div>

              {user?.emailVerified ? (
                <div className="flex min-w-[120px] items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Verified</span>
                </div>
              ) : (
                <div className="flex min-w-[120px] items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
                  <span className="font-medium">Unverified</span>
                </div>
              )}
            </div>
            <p className="text-muted-foreground text-xs">
              Your primary email is used for important security and transaction
              notifications. Contact support to change your email address.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="text-primary h-5 w-5" />
            Regional & Localization
          </CardTitle>
          <CardDescription>
            Configure your location, preferred currency for reporting, and local
            time zone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/30">
                <Globe className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country ?? undefined}
                  onValueChange={(value) =>
                    handleSelectChange("country", value)
                  }
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CountryOptions).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  This helps localize language and regulatory information.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-full bg-purple-50 p-3 text-purple-600 dark:bg-purple-900/30">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="timezone">Time Zone</Label>
                <Select
                  value={formData.timezone ?? undefined}
                  onValueChange={(value) =>
                    handleSelectChange("timezone", value)
                  }
                >
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select your time zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TimezoneOptions).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">
                  Used for all timestamps on transactions and reports.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Reset */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="text-primary h-5 w-5" />
            Reset Password
          </CardTitle>
          <CardDescription>
            Change your password to keep your account secure. You will be logged
            out of all active sessions after the change.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                Minimum 8 characters, including one uppercase, one lowercase,
                and one number.
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
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={loadingState.isChangingPassword}
            >
              {loadingState.isChangingPassword
                ? "Updating..."
                : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          size="lg"
          onClick={handleUpdateProfile}
          disabled={loadingState.isUpdatingProfile}
        >
          {loadingState.isUpdatingProfile ? "Updating..." : "Update Profile"}
        </Button>
      </div>
    </div>
  );
}
