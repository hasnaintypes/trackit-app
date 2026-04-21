"use client";

import type React from "react";
import type {
  Gender,
  Country,
  Timezone,
  UpdateProfileInput,
} from "@/types/user";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { toast } from "sonner";
import {
  GenderOptions,
  CountryOptions,
  TimezoneOptions,
} from "@/constants/formatting";
import { Card, CardContent } from "@ui/card";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Label } from "@ui/label";
import { CheckCircle, ImagePlus } from "lucide-react";
import Image from "next/image";

interface FormData {
  fullName: string;
  email: string;
  gender: Gender | null;
  country: Country | null;
  timezone: Timezone | null;
}

export default function EditProfileSection() {
  const { user, isLoading, updateProfile, uploadFile } = useUser();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    gender: "OTHER" as Gender,
    country: "US" as Country,
    timezone: "UTC" as Timezone,
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: user.name ?? "",
        email: user.email ?? "",
        gender: user.gender! ?? prev.gender,
        country: user.country! ?? prev.country,
        timezone: user.timezone! ?? prev.timezone,
      }));
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
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
      setIsUploadingImage(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsUpdatingProfile(true);

      const updateData: UpdateProfileInput = {
        name: formData.fullName,
        ...(formData.gender != null && { gender: formData.gender }),
        country: formData.country ?? undefined,
        timezone: formData.timezone ?? undefined,
      };

      await updateProfile(updateData);

      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(
        "Failed to update profile: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setIsUpdatingProfile(false);
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
    setFormData((prev) => ({ ...prev, [name]: value }) as FormData);
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Card — Avatar + Name */}
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            {/* Avatar */}
            <div className="bg-muted relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "Profile"}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-muted-foreground text-2xl font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </span>
              )}
            </div>

            {/* Name + Email */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold">
                {isLoading ? "Loading..." : (user?.name ?? "Your Name")}
              </h2>
              <p className="text-muted-foreground text-sm">
                {user?.email ?? ""}
              </p>
            </div>

            {/* Avatar Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => document.getElementById("profileImage")?.click()}
                disabled={isUploadingImage}
              >
                <ImagePlus className="h-4 w-4" />
                {isUploadingImage ? "Uploading..." : "Replace"}
              </Button>
              <input
                type="file"
                id="profileImage"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Full Name */}
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

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender ?? undefined}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger id="gender" className="w-full">
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

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  readOnly
                  className="bg-muted pr-24"
                />
                {user?.emailVerified && (
                  <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Verified
                  </div>
                )}
              </div>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={formData.country ?? undefined}
                onValueChange={(value) => handleSelectChange("country", value)}
              >
                <SelectTrigger id="country" className="w-full">
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
            </div>

            {/* Timezone */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone ?? undefined}
                onValueChange={(value) => handleSelectChange("timezone", value)}
              >
                <SelectTrigger id="timezone" className="w-full">
                  <SelectValue placeholder="Select your timezone" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TimezoneOptions).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
              {isUpdatingProfile ? "Saving..." : "Save changes"}
            </Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
