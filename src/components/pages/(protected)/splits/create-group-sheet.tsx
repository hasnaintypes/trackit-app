"use client";

import React, { useState, useCallback } from "react";
import {
  Users,
  Home,
  Plane,
  Heart,
  Briefcase,
  X,
  Check,
  Loader2,
  Search,
} from "lucide-react";
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
import { Textarea } from "@ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { Badge } from "@ui/badge";
import { ColorPicker } from "@/components/common/pickers/color-picker";
import { useIsMobile } from "@/hooks/use-mobile";
import { generateNamedAvatar } from "@/lib/shared/avatar";
import type { Currency } from "@prisma/client";
import type { GroupType } from "@/types/group";

interface SheetContact {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  linkedUserId: string | null;
  linkedUser: { id: string; name: string; image: string | null } | null;
}

const GROUP_TYPES: {
  value: GroupType;
  label: string;
  icon: React.ElementType;
}[] = [
  { value: "FRIENDS", label: "Friends", icon: Users },
  { value: "ROOMMATES", label: "Roommates", icon: Home },
  { value: "TRIP", label: "Trip", icon: Plane },
  { value: "COUPLE", label: "Couple", icon: Heart },
  { value: "FAMILY", label: "Family", icon: Heart },
  { value: "WORK", label: "Work", icon: Briefcase },
  { value: "OTHER", label: "Other", icon: Users },
];

const CURRENCY_OPTIONS: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "\u20AC" },
  { value: "GBP", label: "British Pound", symbol: "\u00A3" },
  { value: "CAD", label: "Canadian Dollar", symbol: "CA$" },
  { value: "AUD", label: "Australian Dollar", symbol: "A$" },
  { value: "JPY", label: "Japanese Yen", symbol: "\u00A5" },
  { value: "INR", label: "Indian Rupee", symbol: "\u20B9" },
  { value: "PKR", label: "Pakistani Rupee", symbol: "Rs" },
  { value: "CHF", label: "Swiss Franc", symbol: "CHF" },
  { value: "CNY", label: "Chinese Yuan", symbol: "\u00A5" },
  { value: "SGD", label: "Singapore Dollar", symbol: "S$" },
];

interface CreateGroupSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacts: SheetContact[];
  onSubmit: (data: {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    type?: GroupType;
    currency?: Currency;
    memberContactIds?: string[];
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function CreateGroupSheet({
  open,
  onOpenChange,
  contacts,
  onSubmit,
  isSubmitting,
}: CreateGroupSheetProps) {
  const isMobile = useIsMobile();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<GroupType>("FRIENDS");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [color, setColor] = useState("#6366f1");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contactSearch, setContactSearch] = useState("");

  const resetForm = useCallback(() => {
    setName("");
    setDescription("");
    setType("FRIENDS");
    setCurrency("USD");
    setColor("#6366f1");
    setSelectedContacts([]);
    setContactSearch("");
  }, []);

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open) resetForm();
      onOpenChange(open);
    },
    [onOpenChange, resetForm],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;

      const selectedType = GROUP_TYPES.find((t) => t.value === type);

      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        icon: selectedType?.label,
        color,
        type,
        currency,
        memberContactIds:
          selectedContacts.length > 0 ? selectedContacts : undefined,
      });

      handleClose(false);
    },
    [
      name,
      description,
      type,
      currency,
      color,
      selectedContacts,
      onSubmit,
      handleClose,
    ],
  );

  const toggleContact = useCallback((contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId],
    );
  }, []);

  const filteredContacts = contacts.filter(
    (c) =>
      contactSearch.length > 0 &&
      (c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
        c.email?.toLowerCase().includes(contactSearch.toLowerCase())),
  );

  const getContactAvatar = (contact: SheetContact) => {
    if (contact.linkedUser?.image) return contact.linkedUser.image;
    if (contact.avatarUrl) return contact.avatarUrl;
    return generateNamedAvatar(contact.name);
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          isMobile
            ? "max-h-[92vh] overflow-y-auto rounded-t-2xl"
            : "w-full overflow-y-auto sm:max-w-lg",
        )}
      >
        <SheetHeader>
          <SheetTitle>Create Group</SheetTitle>
          <SheetDescription>
            Create a new group to split expenses with friends.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-4">
          {/* Group name */}
          <div className="space-y-2">
            <Label
              htmlFor="group-name"
              className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
            >
              Group Name
            </Label>
            <Input
              id="group-name"
              placeholder="e.g., Trip to Paris"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10"
              autoFocus
            />
          </div>

          {/* Type + Currency row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Type
              </Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as GroupType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <span className="flex items-center gap-2">
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Currency
              </Label>
              <Select
                value={currency}
                onValueChange={(v) => setCurrency(v as Currency)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground w-6 text-center font-mono text-xs">
                          {c.symbol}
                        </span>
                        <span>{c.value}</span>
                        <span className="text-muted-foreground text-xs">
                          — {c.label}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Color
            </Label>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="group-desc"
              className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
            >
              Description{" "}
              <span className="text-muted-foreground/60 normal-case">
                (optional)
              </span>
            </Label>
            <Textarea
              id="group-desc"
              placeholder="What's this group for?"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Add members */}
          <div className="space-y-2">
            <Label className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              Add Members
            </Label>

            {/* Selected members */}
            {selectedContacts.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedContacts.map((id) => {
                  const contact = contacts.find((c) => c.id === id);
                  if (!contact) return null;
                  return (
                    <Badge key={id} variant="secondary" className="gap-1 pr-1">
                      {contact.name}
                      <button
                        type="button"
                        onClick={() => toggleContact(id)}
                        className="hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Type to search contacts..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Contact list — only visible when searching */}
            {contactSearch.length > 0 && (
              <div className="max-h-40 overflow-y-auto rounded-lg border">
                {filteredContacts.length === 0 ? (
                  <p className="text-muted-foreground px-3 py-4 text-center text-sm">
                    {contacts.length === 0
                      ? "No contacts yet. Add contacts from the Contacts tab."
                      : "No contacts match your search."}
                  </p>
                ) : (
                  filteredContacts.map((contact) => {
                    const isSelected = selectedContacts.includes(contact.id);
                    return (
                      <button
                        key={contact.id}
                        type="button"
                        onClick={() => toggleContact(contact.id)}
                        className={cn(
                          "hover:bg-accent flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                          isSelected && "bg-accent/50",
                        )}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getContactAvatar(contact)} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {contact.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {contact.name}
                          </p>
                          {contact.email && (
                            <p className="text-muted-foreground truncate text-xs">
                              {contact.email}
                            </p>
                          )}
                        </div>
                        {isSelected && (
                          <Check className="text-primary h-4 w-4 shrink-0" />
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <SheetFooter className="px-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Group
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
