"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Users,
  Home,
  Plane,
  Heart,
  Briefcase,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Card, CardContent } from "@ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@ui/tooltip";
import { generateNamedAvatar } from "@/lib/shared/avatar";
import type { GroupType, GroupMember } from "@/types/group";

const GROUP_TYPE_CONFIG: Record<
  GroupType,
  { icon: React.ElementType; label: string }
> = {
  ROOMMATES: { icon: Home, label: "Roommates" },
  TRIP: { icon: Plane, label: "Trip" },
  COUPLE: { icon: Heart, label: "Couple" },
  FRIENDS: { icon: Users, label: "Friends" },
  FAMILY: { icon: Heart, label: "Family" },
  WORK: { icon: Briefcase, label: "Work" },
  OTHER: { icon: Users, label: "Other" },
};

interface GroupHeaderProps {
  name: string;
  type: GroupType;
  currency: string;
  color?: string | null;
  members: GroupMember[];
  onAddExpense: () => void;
}

function GroupHeaderInner({
  name,
  type,
  currency,
  color,
  members,
  onAddExpense,
}: GroupHeaderProps) {
  const config = GROUP_TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <Card>
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/splits"
            className="text-muted-foreground hover:text-foreground hover:bg-accent -ml-1 rounded-lg p-1.5 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-sm"
            style={{ backgroundColor: color ?? "#6366f1" }}
          >
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl leading-tight font-bold">{name}</h1>
              <Badge
                variant="secondary"
                className="text-muted-foreground h-5 px-1.5 text-[10px] font-medium uppercase"
              >
                {config.label}
              </Badge>
              <Badge
                variant="outline"
                className="h-5 px-1.5 text-[10px] font-medium"
              >
                {currency}
              </Badge>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <p className="text-muted-foreground text-sm">
                {members.length} {members.length === 1 ? "member" : "members"}
              </p>
              <TooltipProvider delayDuration={200}>
                <div className="ml-1 flex -space-x-1.5">
                  {members.slice(0, 5).map((member) => {
                    const memberName = member.contact?.name ?? "You";
                    const avatarSrc =
                      member.contact?.avatarUrl ??
                      generateNamedAvatar(memberName);
                    return (
                      <Tooltip key={member.id}>
                        <TooltipTrigger asChild>
                          <Avatar className="border-background h-7 w-7 cursor-default border-2 transition-transform hover:z-10 hover:scale-110">
                            <AvatarImage src={avatarSrc} />
                            <AvatarFallback className="bg-muted text-[9px] font-medium">
                              {memberName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                          {memberName}
                          {member.role === "OWNER" && (
                            <span className="text-muted-foreground ml-1">
                              (owner)
                            </span>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                  {members.length > 5 && (
                    <div className="border-background bg-muted text-muted-foreground flex h-7 w-7 items-center justify-center rounded-full border-2 text-[9px] font-medium">
                      +{members.length - 5}
                    </div>
                  )}
                </div>
              </TooltipProvider>
            </div>
          </div>
        </div>

        <Button onClick={onAddExpense} className="shrink-0 shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </CardContent>
    </Card>
  );
}

export const GroupHeader = React.memo(GroupHeaderInner);
