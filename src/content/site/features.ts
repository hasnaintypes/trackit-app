import type { FeaturesContent } from "@/types/site";

export const featuresContent: FeaturesContent = {
  heading:
    "The Cashio ecosystem unites finance, automation, and collaboration.",
  subheading:
    "Cashio goes beyond personal finance tracking. It’s a complete ecosystem  from real-time group management to AI-driven insights helping users and teams grow smarter with money.",
  leftFeatures: [
    {
      title: "Multi-Account Tracking",
      description:
        "Manage all your wallets, accounts, and cards in one dashboard with live balance updates.",
      position: "left",
      cornerStyle: "sm:translate-x-4 sm:rounded-br-[2px]",
    },
    {
      title: "Group Expenses",
      description:
        "Share, split, and settle group expenses instantly with real-time collaboration and roles.",
      position: "left",
      cornerStyle: "sm:-translate-x-4 sm:rounded-br-[2px]",
    },
    {
      title: "AI Insights",
      description:
        "Get intelligent summaries and predictive analytics to stay ahead of bills and overspending.",
      position: "left",
      cornerStyle: "sm:translate-x-4 sm:rounded-tr-[2px]",
    },
  ],
  rightFeatures: [
    {
      title: "Smart Budgeting",
      description:
        "Create goal-based budgets and track progress automatically with helpful notifications.",
      position: "right",
      cornerStyle: "sm:-translate-x-4 sm:rounded-bl-[2px]",
    },
    {
      title: "Secure Payments",
      description:
        "Use Stripe-powered transfers, top-ups, and reconciliations  all protected by 2FA and audit logs.",
      position: "right",
      cornerStyle: "sm:translate-x-4 sm:rounded-bl-[2px]",
    },
    {
      title: "Custom Reports",
      description:
        "Export insights to PDF, Excel, or Sheets. Visualize trends with clear, AI-generated charts.",
      position: "right",
      cornerStyle: "sm:-translate-x-4 sm:rounded-tl-[2px]",
    },
  ],
  center: {
    title: "A connected financial ecosystem",
    description:
      "Cashio links your accounts, AI insights, and collaboration tools into one powerful experience. It’s the smarter, faster, and safer way to manage both personal and group finances.",
  },
  teaser: {
    heading:
      "Practical finance that gets you results quickly and clearly built for individuals and groups",
    subheading:
      "Set up in minutes, sync accounts, track shared balances, and automate recurring actions like bill reminders and transfers. Cashio removes the busywork so you can focus on what matters.",
    title: "Start with clarity, finish with control",
    description:
      "Fast setup, clear shared balances, seamless integrations, and automatic routines that run in the background everything focused on helping you act, not plan. Built-in security, audit logs, and role-based sharing keep your finances safe and transparent.",
  },
};

export default featuresContent;
