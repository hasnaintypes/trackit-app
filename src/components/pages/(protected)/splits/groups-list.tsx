"use client";

import React from "react";
import { Users, Plus } from "lucide-react";
import { GroupCard } from "./group-card";
import { Button } from "@ui/button";
import type { GroupType } from "@/types/group";

interface GroupListMember {
  id: string;
  contactId: string | null;
  role: string;
  contact: { id: string; name: string; avatarUrl: string | null } | null;
}

interface GroupListItem {
  id: string;
  name: string;
  description?: string | null;
  type: GroupType;
  currency: string;
  memberCount: number;
  members: GroupListMember[];
  isArchived: boolean;
}

interface GroupsListProps {
  groups: GroupListItem[];
  isLoading?: boolean;
  onCreateGroup: () => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
}

function GroupsListInner({
  groups,
  isLoading,
  onCreateGroup,
  onArchive,
  onUnarchive,
  onDelete,
}: GroupsListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card rounded-2xl border p-5 shadow-sm dark:border-white/10"
          >
            <div className="bg-muted absolute inset-x-0 top-0 h-[2px]" />
            <div className="flex items-center gap-3">
              <div className="bg-muted h-10 w-10 animate-pulse rounded-xl" />
              <div className="space-y-2">
                <div className="bg-muted h-4 w-28 animate-pulse rounded" />
                <div className="bg-muted h-3 w-20 animate-pulse rounded" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex -space-x-1.5">
                {[1, 2, 3].map((j) => (
                  <div
                    key={j}
                    className="bg-muted h-7 w-7 animate-pulse rounded-full"
                  />
                ))}
              </div>
              <div className="bg-muted h-3 w-16 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="bg-card flex flex-col items-center justify-center rounded-2xl border px-6 py-16 shadow-sm dark:border-white/10">
        <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
          <Users className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">No groups yet</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Create a group to start splitting expenses with friends.
        </p>
        <Button onClick={onCreateGroup} className="mt-5">
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          {...group}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export const GroupsList = React.memo(GroupsListInner);
