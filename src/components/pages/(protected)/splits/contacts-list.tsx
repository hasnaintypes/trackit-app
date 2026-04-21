"use client";

import React from "react";
import {
  UserPlus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Link2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { generateNamedAvatar } from "@/lib/shared/avatar";

interface ContactItem {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  linkedUserId: string | null;
  linkedUser: { id: string; name: string; image: string | null } | null;
  createdAt: string;
  updatedAt: string;
}

interface ContactsListProps {
  contacts: ContactItem[];
  isLoading?: boolean;
  onAddContact: () => void;
  onEditContact: (contact: ContactItem) => void;
  onDeleteContact: (id: string) => void;
}

function getContactAvatarUrl(contact: ContactItem): string {
  if (contact.linkedUser?.image) return contact.linkedUser.image;
  if (contact.avatarUrl) return contact.avatarUrl;
  return generateNamedAvatar(contact.name);
}

function ContactsListInner({
  contacts,
  isLoading,
  onAddContact,
  onEditContact,
  onDeleteContact,
}: ContactsListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-card flex items-center gap-3 rounded-2xl border p-4 shadow-sm dark:border-white/10"
          >
            <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="bg-muted h-4 w-24 animate-pulse rounded" />
              <div className="bg-muted h-3 w-36 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="bg-card flex flex-col items-center justify-center rounded-2xl border px-6 py-16 shadow-sm dark:border-white/10">
        <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
          <UserPlus className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No contacts yet</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Add people you split expenses with.
        </p>
        <Button onClick={onAddContact} className="mt-5">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {contacts.map((contact) => (
        <div
          key={contact.id}
          className="bg-card group hover:ring-ring/20 flex items-center gap-3 rounded-2xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:ring-1 dark:border-white/10"
        >
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={getContactAvatarUrl(contact)} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {contact.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-semibold">{contact.name}</p>
              {contact.linkedUserId && (
                <Badge
                  variant="secondary"
                  className="h-4 gap-0.5 px-1 py-0 text-[10px]"
                >
                  <Link2 className="h-2.5 w-2.5" />
                  Linked
                </Badge>
              )}
            </div>
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              {contact.email && (
                <span className="flex items-center gap-1 truncate">
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{contact.email}</span>
                </span>
              )}
              {contact.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3 shrink-0" />
                  {contact.phone}
                </span>
              )}
              {!contact.email && !contact.phone && (
                <span className="italic">No contact info</span>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditContact(contact)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDeleteContact(contact.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}

export const ContactsList = React.memo(ContactsListInner);
