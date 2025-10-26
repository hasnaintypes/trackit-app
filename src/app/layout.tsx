import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

import { Toaster } from "@/components/ui/sonner";
import { BetterStackWebVitals } from "@logtail/next";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "Cashio – Smarter Finance Management",
    template: "%s | Cashio",
  },
  description:
    "Cashio is your all-in-one finance management platform. Track budgets, split expenses, analyze spending with AI, and manage subscriptionsall in one dashboard.",
  keywords: [
    "finance app",
    "budget tracker",
    "expense manager",
    "AI finance analytics",
    "group expenses",
    "SaaS finance dashboard",
  ],
  authors: [{ name: "Cashio Team" }],
  creator: "Cashio",
  metadataBase: new URL("https://cashio.vercel.app"),
  openGraph: {
    title: "Cashio – Smarter Finance Management",
    description:
      "Unify your personal and group finances with AI insights, budgeting, and expense tracking.",
    url: "https://cashio.vercel.app",
    siteName: "Cashio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://cashio.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cashio Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cashio – Smarter Finance Management",
    description:
      "AI-powered finance platform for personal budgets and group expenses.",
    creator: "@cashioapp",
    images: ["https://cashio.vercel.app/og-image.png"],
  },
  icons: {
    icon: "/public/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <body>
        <BetterStackWebVitals />
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </TRPCReactProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
