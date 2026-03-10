"use client";

import Link from "next/link";
import { Logo } from "@/components/common/logo";
import NotificationMenu from "@/components/common/notification-menu";
import UserMenu from "@/components/common/user-menu";
import ThemeSwitcherButton from "@/components/common/theme-switcher-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Search,
  Menu,
  Home,
  ArrowLeftRight,
  Wallet,
  PieChart,
  FileText,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

const navigationLinks = [
  { href: "/overview", label: "Dashboard", icon: Home },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budget", label: "Budget", icon: PieChart },
  { href: "/accounts", label: "Accounts", icon: Wallet },
];

const quickActions = [
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help Center", icon: HelpCircle },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);
  return (
    <header className="text-primary-foreground">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:gap-6 md:px-8">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center gap-6 lg:gap-8">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="text-primary-foreground hover:bg-primary-foreground/10 size-9 lg:hidden"
                variant="ghost"
                size="icon"
              >
                <Menu className="size-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-48 border p-2 lg:hidden"
            >
              <nav className="flex flex-col gap-1">
                {navigationLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="hover:bg-accent rounded-md px-3 py-2 text-sm font-medium transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </PopoverContent>
          </Popover>

          {/* Logo */}
          <Link
            href="/overview"
            className="hover:opacity-90 flex items-center transition-opacity"
          >
            <Logo showText />
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="max-lg:hidden">
            <NavigationMenuList className="gap-1">
              {navigationLinks.map((link, index) => (
                <NavigationMenuItem key={index}>
                  <NavigationMenuLink
                    asChild
                    className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 cursor-pointer rounded-md px-3 py-2 font-medium transition-colors"
                  >
                    <Link href={link.href}>{link.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Center - Search Bar */}
        <div
          className="relative hidden flex-1 max-w-md cursor-pointer xl:block"
          onClick={() => setOpen(true)}
        >
          <Search className="text-primary-foreground/60 pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search anything..."
            readOnly
            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus-visible:bg-primary-foreground/15 h-10 w-full cursor-pointer rounded-md border pl-10 pr-16 transition-colors focus-visible:ring-1 focus-visible:ring-white/50"
          />
          <kbd className="text-primary-foreground/60 pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/20 bg-white/10 px-2 py-0.5 text-xs font-medium">
            ⌘ F
          </kbd>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
            className="text-primary-foreground hover:bg-primary-foreground/10 size-9 xl:hidden"
          >
            <Search className="size-5" />
          </Button>
          <ThemeSwitcherButton />
          <NotificationMenu />
          <UserMenu />
        </div>
      </div>

      {/* Command Dialog */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search anything..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {navigationLinks.map((link) => (
              <CommandItem
                key={link.href}
                onSelect={() => {
                  setOpen(false);
                  window.location.href = link.href;
                }}
              >
                <link.icon className="mr-2 size-4" />
                <span>{link.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Actions">
            {quickActions.map((action) => (
              <CommandItem
                key={action.href}
                onSelect={() => {
                  setOpen(false);
                  window.location.href = action.href;
                }}
              >
                <action.icon className="mr-2 size-4" />
                <span>{action.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
