import type { FeaturesContent } from "@/types/site";

export const featuresContent: FeaturesContent = {
  heading: "Features of Trackit personal finance",
  description:
    "Trackit is quick and easy to set up with any bank account, budget, or spending habit. Here are all the features you need (see below) without any of the complexity.\n\nOur software helps you understand your finances without compromising your privacy. That's why individuals and teams trust Trackit for their personal finance tracking.",
  sections: [
    {
      id: "dashboard",
      title: "Dashboard",
      description:
        "All the data you need on a single page, so you can quickly figure out what's happening with your finances. See accounts, balances, transactions, categories, and trends at a glance.",
      items: [
        {
          title: "Real-time balances",
          description:
            "We process data instantly, so your balances are always up to date. Add a transaction and see your dashboard update immediately.",
        },
        {
          title: "Multi-account tracking",
          description:
            "See data about every account on a single screen with our all-accounts view. This includes balances, recent transactions, and spending breakdowns for every account.",
        },
        {
          title: "Transaction categorization",
          description:
            "Transactions are automatically categorized by our AI. You can also create custom categories and subcategories to organize spending exactly how you want.",
        },
        {
          title: "Spending trends",
          description:
            "Your dashboard shows spending trends over time with clear, easy-to-read charts. Compare month-over-month, see category breakdowns, and spot patterns.",
        },
        {
          title: "CSV import",
          description:
            "You can import your transaction data at any time from a CSV file. Smart column mapping detects your file format automatically.",
        },
        {
          title: "Receipt OCR",
          description:
            "Scan receipts using AI-powered OCR that extracts the merchant name, amount, date, and category automatically from a photo.",
        },
      ],
    },
    {
      id: "budgets",
      title: "Budgets & AI insights",
      description:
        "Smart budgeting with AI-powered insights that help you stay on track. Set budgets, get alerts, and receive personalized financial advice powered by Google Gemini.",
      items: [
        {
          title: "Smart budgeting",
          description:
            "Create budgets for any category with daily, weekly, monthly, or yearly periods. Track progress in real-time with visual progress bars.",
        },
        {
          title: "Budget alerts",
          description:
            "Get email notifications when you reach 70%, 90%, or 100% of your budget. Alerts are deduplicated so you only hear from us when it matters.",
        },
        {
          title: "AI spending insights",
          description:
            "Gemini analyzes your spending patterns and provides personalized insights about where your money goes and how to optimize.",
        },
        {
          title: "Anomaly detection",
          description:
            "Our AI flags unusual transactions and spending patterns. If something looks off compared to your normal behavior, you'll know about it.",
        },
        {
          title: "Hierarchical categories",
          description:
            "Parent category budgets automatically include subcategory spending. Budget 'Food' and it tracks both 'Groceries' and 'Dining Out'.",
        },
        {
          title: "Financial advice",
          description:
            "Get AI-generated financial advice and recommendations based on your actual spending data, delivered to your inbox on a regular schedule.",
        },
      ],
    },
    {
      id: "splits",
      title: "Splits & groups",
      description:
        "Manage shared expenses with friends, family, or roommates. Create groups, split bills, simplify debts, and settle up with minimal payments.",
      items: [
        {
          title: "Group expenses",
          description:
            "Create groups and log shared expenses. Everyone can see who paid what and who owes whom at any time.",
        },
        {
          title: "Multiple split methods",
          description:
            "Split expenses equally, by exact amounts, by percentage, or by shares. Choose the method that works best for each expense.",
        },
        {
          title: "Debt simplification",
          description:
            "Our algorithm minimizes the number of payments needed to settle all debts in a group. Five people with ten debts? Simplified to just a few transfers.",
        },
        {
          title: "Settlement tracking",
          description:
            "Record payments between members and track who has settled up. See outstanding balances at a glance in the group dashboard.",
        },
        {
          title: "Contact management",
          description:
            "Build a contact list of people you split expenses with regularly. Add them to groups instantly without re-entering details.",
        },
        {
          title: "Group analytics",
          description:
            "View spending charts and breakdowns per group. See who spends the most, category distributions, and expense history over time.",
        },
      ],
    },
    {
      id: "reports",
      title: "Reports & automation",
      description:
        "Automated financial reports delivered to your inbox on a schedule. Weekly digests, monthly summaries, and custom reports you can generate anytime.",
      items: [
        {
          title: "Weekly digest",
          description:
            "Every Monday, receive an email summary of last week's spending with category breakdowns and comparisons to previous weeks.",
        },
        {
          title: "Monthly summaries",
          description:
            "Detailed monthly reports with total income, expenses, savings rate, top categories, and trend analysis delivered on the 1st of each month.",
        },
        {
          title: "Custom reports",
          description:
            "Generate reports for any date range from the Reports page. Filter by account, category, or transaction type and resend to your inbox.",
        },
        {
          title: "Recurring transactions",
          description:
            "Set up recurring transactions that are automatically created on your schedule. Subscriptions, rent, salary — all handled automatically.",
        },
        {
          title: "Email notifications",
          description:
            "Budget alerts, transaction confirmations, and AI insights are all delivered via beautifully designed email templates.",
        },
        {
          title: "Data export",
          description:
            "Export your financial data anytime. Download transactions, reports, and summaries for your records or external tools.",
        },
      ],
    },
    {
      id: "settings",
      title: "Security & settings",
      description:
        "Even though our software is simple, it's packed with features you can adjust and use to customize exactly how you need it to work for your account.",
      items: [
        {
          title: "Email verification",
          description:
            "All accounts require email verification before accessing the platform. This ensures only you can use your account.",
        },
        {
          title: "Google OAuth",
          description:
            "Sign in instantly with your Google account. No password to remember, and your account is protected by Google's security infrastructure.",
        },
        {
          title: "Currency customization",
          description:
            "Choose from dozens of currencies with full control over symbol position, decimal places, thousand separators, and compact display.",
        },
        {
          title: "Locale settings",
          description:
            "Configure your preferred language, date format, time format, and number formatting to match your region and preferences.",
        },
        {
          title: "Session management",
          description:
            "Secure session handling with automatic expiry. View active sessions and sign out of any device from your settings page.",
        },
        {
          title: "Rate limiting",
          description:
            "Built-in protection against brute-force attacks. All API endpoints are rate-limited with strict server-side authorization on every call.",
        },
      ],
    },
  ],
};

export default featuresContent;
