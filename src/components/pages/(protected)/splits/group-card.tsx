"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  Home,
  Plane,
  Heart,
  Briefcase,
  MoreHorizontal,
  Archive,
  Trash2,
  ArchiveRestore,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { generateNamedAvatar } from "@/lib/shared/avatar";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import type { GroupType } from "@/types/group";

const GROUP_TYPE_CONFIG: Record<
  GroupType,
  {
    icon: React.ElementType;
    label: string;
    color: string;
    bgLight: string;
    textColor: string;
  }
> = {
  ROOMMATES: {
    icon: Home,
    label: "Roommates",
    color: "bg-orange-500",
    bgLight: "bg-orange-100 dark:bg-orange-900/40",
    textColor: "text-orange-600 dark:text-orange-400",
  },
  TRIP: {
    icon: Plane,
    label: "Trip",
    color: "bg-sky-500",
    bgLight: "bg-sky-100 dark:bg-sky-900/40",
    textColor: "text-sky-600 dark:text-sky-400",
  },
  COUPLE: {
    icon: Heart,
    label: "Couple",
    color: "bg-pink-500",
    bgLight: "bg-pink-100 dark:bg-pink-900/40",
    textColor: "text-pink-600 dark:text-pink-400",
  },
  FRIENDS: {
    icon: Users,
    label: "Friends",
    color: "bg-violet-500",
    bgLight: "bg-violet-100 dark:bg-violet-900/40",
    textColor: "text-violet-600 dark:text-violet-400",
  },
  FAMILY: {
    icon: Heart,
    label: "Family",
    color: "bg-rose-500",
    bgLight: "bg-rose-100 dark:bg-rose-900/40",
    textColor: "text-rose-600 dark:text-rose-400",
  },
  WORK: {
    icon: Briefcase,
    label: "Work",
    color: "bg-slate-500",
    bgLight: "bg-slate-100 dark:bg-slate-800/60",
    textColor: "text-slate-600 dark:text-slate-400",
  },
  OTHER: {
    icon: Users,
    label: "Other",
    color: "bg-gray-500",
    bgLight: "bg-gray-100 dark:bg-gray-800/60",
    textColor: "text-gray-600 dark:text-gray-400",
  },
};

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
];

interface GroupCardMember {
  id: string;
  contactId: string | null;
  role: string;
  contact: { id: string; name: string; avatarUrl: string | null } | null;
}

interface GroupCardProps {
  id: string;
  name: string;
  description?: string | null;
  type: GroupType;
  currency: string;
  memberCount: number;
  members: GroupCardMember[];
  isArchived: boolean;
  onArchive?: (id: string) => void;
  onUnarchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function GroupCardInner({
  id,
  name,
  description,
  type,
  currency,
  memberCount,
  members,
  isArchived,
  onArchive,
  onUnarchive,
  onDelete,
}: GroupCardProps) {
  const config = GROUP_TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "bg-card group hover:ring-ring/20 relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:ring-1 dark:border-white/10",
        isArchived && "opacity-60",
      )}
    >
      {/* Top accent gradient */}
      <div className={cn("absolute inset-x-0 top-0 h-[2px]", config.color)} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/splits/${id}`}
          className="flex min-w-0 flex-1 items-center gap-3"
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              config.bgLight,
              config.textColor,
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{name}</h3>
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <span className={cn("font-medium", config.textColor)}>
                {config.label}
              </span>
              <span>·</span>
              <span>{currency}</span>
            </div>
          </div>
        </Link>

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
            {isArchived ? (
              <DropdownMenuItem onClick={() => onUnarchive?.(id)}>
                <ArchiveRestore className="mr-2 h-4 w-4" />
                Unarchive
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onArchive?.(id)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete?.(id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      {description && (
        <p className="text-muted-foreground mt-2.5 line-clamp-1 text-xs">
          {description}
        </p>
      )}

      {/* Members + Navigate */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {members.slice(0, 4).map((member, i) => {
              const memberName = member.contact?.name ?? "You";
              const avatarSrc =
                member.contact?.avatarUrl ?? generateNamedAvatar(memberName);
              return (
                <Avatar
                  key={member.id}
                  className="border-background h-7 w-7 border-2"
                >
                  <AvatarImage src={avatarSrc} />
                  <AvatarFallback
                    className={cn(
                      "text-[10px] font-semibold",
                      AVATAR_COLORS[i % AVATAR_COLORS.length],
                    )}
                  >
                    {memberName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              );
            })}
            {memberCount > 4 && (
              <div className="border-background bg-muted text-muted-foreground flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-semibold">
                +{memberCount - 4}
              </div>
            )}
          </div>
          <span className="text-muted-foreground text-xs">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
        </div>

        <Link
          href={`/splits/${id}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export const GroupCard = React.memo(GroupCardInner);
