import "@/styles/globals.css";

import { type Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

import { Toaster } from "@/components/ui/sonner";
import { BetterStackWebVitals } from "@logtail/next";
import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "Trackit – Smarter Finance Management",
    template: "%s | Trackit",
  },
  description:
    "Trackit is your all-in-one finance management platform. Track budgets, split expenses, analyze spending with AI, and manage subscriptionsall in one dashboard.",
  keywords: [
    "finance app",
    "budget tracker",
    "expense manager",
    "AI finance analytics",
    "group expenses",
    "SaaS finance dashboard",
  ],
  authors: [{ name: "Trackit Team" }],
  creator: "Trackit",
  metadataBase: new URL("https://trackit.vercel.app"),
  openGraph: {
    title: "Trackit – Smarter Finance Management",
    description:
      "Unify your personal and group finances with AI insights, budgeting, and expense tracking.",
    url: "https://trackit.vercel.app",
    siteName: "Trackit",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://trackit.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Trackit Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Trackit – Smarter Finance Management",
    description:
      "AI-powered finance platform for personal budgets and group expenses.",
    creator: "@trackitapp",
    images: ["https://trackit.vercel.app/og-image.png"],
  },
  icons: {
    icon: "/images/brand/logo.png",
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const jetbrains_mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
});

import { PageLoader } from "@/components/common/page-loader";
import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains_mono.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <BetterStackWebVitals />
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={null}>
              <PageLoader />
            </Suspense>
            {children}
          </ThemeProvider>
        </TRPCReactProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
