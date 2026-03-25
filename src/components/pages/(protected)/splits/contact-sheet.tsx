"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Loader2, User, Mail, Phone, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@ui/sheet";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";
import { generateNamedAvatar } from "@/lib/shared/avatar";

interface SheetContact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
}

interface ContactSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: SheetContact | null;
  onSubmit: (data: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function ContactSheet({
  open,
  onOpenChange,
  contact,
  onSubmit,
  isSubmitting,
}: ContactSheetProps) {
  const isMobile = useIsMobile();
  const isEditing = !!contact;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<string | null>(null);

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setEmail(contact.email ?? "");
      setPhone(contact.phone ?? "");
      setAvatarPreview(contact.avatarUrl);
      setAvatarFile(null);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  }, [contact, open]);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setAvatarPreview(result);
          setAvatarFile(result);
        }
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleRemoveAvatar = useCallback(() => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;

      await onSubmit({
        ...(contact?.id ? { id: contact.id } : {}),
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        avatarUrl: avatarFile ?? undefined,
      });

      onOpenChange(false);
    },
    [name, email, phone, avatarFile, contact, onSubmit, onOpenChange],
  );

  // Resolve display avatar: uploaded file > existing avatar > DiceBear
  const displayAvatar =
    avatarPreview ??
    (name.trim() ? generateNamedAvatar(name.trim()) : undefined);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          isMobile
            ? "max-h-[92vh] overflow-y-auto rounded-t-2xl"
            : "w-full overflow-y-auto sm:max-w-md",
        )}
      >
        <SheetHeader>
          <SheetTitle>{isEditing ? "Edit Contact" : "Add Contact"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Update contact details."
              : "Add a person you split expenses with."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-4">
          {/* Avatar preview + upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="group relative">
              <Avatar className="h-20 w-20">
                {displayAvatar && <AvatarImage src={displayAvatar} />}
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {name.trim() ? (
                    name.trim().charAt(0).toUpperCase()
                  ) : (
                    <User className="h-8 w-8" />
                  )}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-primary text-primary-foreground absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110 dark:border-gray-900"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full shadow-sm"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <p className="text-muted-foreground text-xs">
              {avatarPreview
                ? "Click camera to change"
                : "Upload a photo or use auto-generated avatar"}
            </p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="contact-name"
              className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
            >
              Name
            </Label>
            <div className="relative">
              <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="contact-name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 pl-9"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="contact-email"
              className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
            >
              Email{" "}
              <span className="text-muted-foreground/60 normal-case">
                (optional)
              </span>
            </Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="contact-email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="contact-phone"
              className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
            >
              Phone{" "}
              <span className="text-muted-foreground/60 normal-case">
                (optional)
              </span>
            </Label>
            <div className="relative">
              <Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="contact-phone"
                type="tel"
                placeholder="+1 234 567 890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 pl-9"
              />
            </div>
          </div>

          <SheetFooter className="px-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Save Changes" : "Add Contact"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
