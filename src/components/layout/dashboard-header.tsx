"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

const secondaryLinks = [
  { href: "/overview", label: "Overview" },
  { href: "/accounts", label: "Wallet" },
  { href: "/transactions", label: "Invoice" },
  { href: "/analytics", label: "Analytics" },
  { href: "/profile", label: "Profile" },
  { href: "/settings", label: "Settings" },
  { href: "/reports", label: "Report" },
];

const getHeaderContent = (pathname: string) => {
  if (pathname.startsWith("/overview")) {
    return {
      title: "Monthly Overview Report",
      description: "This is your Monthly Overview Report",
    };
  }
  if (pathname.startsWith("/accounts")) {
    return {
      title: "Wallet Management",
      description: "Manage your accounts and balances",
    };
  }
  if (pathname.startsWith("/transactions")) {
    return {
      title: "Transaction History",
      description: "View and manage your transactions",
    };
  }
  if (pathname.startsWith("/budget")) {
    return {
      title: "Budget Overview",
      description: "Track your budgets and spending",
    };
  }
  if (pathname.startsWith("/analytics")) {
    return {
      title: "Analytics",
      description: "Visualize your spending and income trends",
    };
  }
  if (pathname.startsWith("/reports")) {
    return {
      title: "Financial Reports",
      description: "View your detailed financial reports",
    };
  }
  if (pathname.startsWith("/settings")) {
    return {
      title: "Account Settings",
      description: "Manage your account preferences",
    };
  }
  if (pathname.startsWith("/profile")) {
    return {
      title: "Profile Settings",
      description: "Update your profile information",
    };
  }
  return {
    title: "Dashboard",
    description: "Welcome to your financial dashboard",
  };
};

export default function DashboardHeader() {
  const { user } = useUser();
  const pathname = usePathname();
  const headerContent = getHeaderContent(pathname);

  const firstName = user?.name?.split(" ")[0] ?? "User";

  return (
    <div className="text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        {/* Top section - Welcome message and navigation */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left side - Welcome message */}
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              Welcome Back, {firstName}
            </h1>
            <p className="text-primary-foreground/70 mt-1 text-sm">
              {headerContent.description}
            </p>
          </div>

          {/* Right side - Secondary navigation with underline active state */}
          <nav className="scrollbar-hide -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-wrap lg:gap-2 lg:overflow-visible lg:px-0">
            {secondaryLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-primary-foreground/70 hover:text-primary-foreground relative whitespace-nowrap px-3 py-2 text-sm font-medium transition-colors",
                    isActive &&
                      "text-primary-foreground after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-white",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
