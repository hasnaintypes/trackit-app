"use client";

import React, { useCallback } from "react";
import { BellIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/trpc/react";
import { invalidateNotifications } from "@/trpc/invalidation";

import { Button } from "@ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";

function Dot({ className }: { className?: string }) {
  return (
    <svg
      width="6"
      height="6"
      fill="currentColor"
      viewBox="0 0 6 6"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}

function NotificationMenuInner() {
  const utils = api.useUtils();
  const { data: notifications = [] } = api.notification.getLatest.useQuery({
    limit: 10,
  });
  const { data: unreadCount = 0 } = api.notification.getUnreadCount.useQuery();

  const markAsRead = api.notification.markAsRead.useMutation({
    onSuccess: () => void invalidateNotifications(utils),
  });

  const markAllAsRead = api.notification.markAllAsRead.useMutation({
    onSuccess: () => void invalidateNotifications(utils),
  });

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead.mutate({ id });
    },
    [markAsRead],
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="text-primary-foreground hover:bg-primary-foreground/10 relative size-9"
          aria-label="Open notifications"
        >
          <BellIcon size={20} aria-hidden="true" />
          {unreadCount > 0 && (
            <div
              aria-hidden="true"
              className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="bg-popover text-foreground border-border w-80 translate-x-[-6px] border p-1 shadow-md md:translate-x-[-8px]"
      >
        <div className="flex items-baseline justify-between gap-4 px-3 py-2">
          <div className="text-sm font-semibold">Notifications</div>
          {unreadCount > 0 && (
            <button
              className="text-xs font-medium hover:underline"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              Mark all as read
            </button>
          )}
        </div>
        <div
          role="separator"
          aria-orientation="horizontal"
          className="bg-border -mx-1 my-1 h-px"
        ></div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="text-muted-foreground p-4 text-center text-sm">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="hover:bg-accent/10 cursor-pointer rounded-md px-3 py-2 text-sm transition-colors"
              >
                <div className="relative flex items-start pe-3">
                  <div className="flex-1 space-y-1">
                    <button
                      className="text-foreground/80 text-left after:absolute after:inset-0"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <span className="text-foreground font-medium">
                        {notification.title}
                      </span>
                      <p className="text-muted-foreground line-clamp-2 text-xs">
                        {notification.message}
                      </p>
                    </button>
                    <div className="text-muted-foreground text-[10px]">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  {!notification.isRead && (
                    <div className="absolute end-0 self-center">
                      <span className="sr-only">Unread</span>
                      <Dot className="text-accent cursor-pointer" />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default React.memo(NotificationMenuInner);
