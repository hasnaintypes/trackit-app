"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { LogOutIcon, Settings } from "lucide-react";
import useUser from "@/hooks/use-user";
import { useAuth } from "@/hooks/use-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
import { Button } from "@ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
import { toast } from "sonner";

function UserMenuInner() {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleSettings = useCallback(() => router.push("/settings"), [router]);

  const handleLogout = useCallback(async () => {
    try {
      // Navigate immediately so the user is redirected without waiting
      // for the signOut network call to finish. Fire-and-forget signOut
      // and show an error toast if it fails.
      router.push("/");
      void signOut().catch(() => {
        toast.error(
          "Failed to complete sign out. Please clear your session manually.",
        );
      });
    } catch {
      toast.error("Failed to log out. Please try again.");
    }
  }, [router, signOut]);

  const initials =
    (user?.name ?? "")
      .split(" ")
      .map((n) => n?.[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("") || "KK";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto cursor-pointer p-0 hover:bg-transparent"
        >
          <Avatar>
            <AvatarImage
              src={user?.image ?? ""}
              alt={user?.name ?? "Profile image"}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-popover text-foreground border-border w-40 border shadow-md"
      >
        <DropdownMenuLabel className="flex min-w-0 flex-col px-3 py-2">
          <span className="text-foreground truncate text-sm font-medium">
            {user?.name ?? "Your name"}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {user?.email ?? "you@example.com"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleSettings}
            className="hover:bg-accent flex cursor-pointer items-center gap-2 px-3 py-2"
          >
            <Settings
              size={16}
              className="mr-2 opacity-60"
              aria-hidden="true"
            />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          className="hover:bg-accent flex cursor-pointer items-center gap-3 px-3 py-2"
        >
          <LogOutIcon size={16} className="opacity-60" aria-hidden="true" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default React.memo(UserMenuInner);
