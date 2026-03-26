import type { HelpContent } from "@/types/site";

const help: HelpContent = {
  hero: {
    title: "Help & Support",
    description:
      "Everything you need to get the most out of Trackit. Browse guides, explore FAQs, or reach out to our team for assistance.",
  },
  cards: [
    {
      title: "Getting Started",
      description:
        "Create your account, complete onboarding, add your first bank account, and start tracking transactions in minutes.",
      linkText: "Read guide",
      href: "/docs/getting-started",
    },
    {
      title: "AI Insights & Budgeting",
      description:
        "Set up budgets with smart alerts, scan receipts with AI, get spending insights, and schedule automated weekly and monthly reports.",
      linkText: "See details",
      href: "/docs/transactions",
    },
    {
      title: "Splits & Group Expenses",
      description:
        "Create groups, add shared expenses, split bills equally or by custom amounts, and settle debts with simplified payments.",
      linkText: "Learn more",
      href: "/docs/security",
    },
  ],
  faqDescription:
    "Find answers to common questions about accounts, transactions, budgets, AI features, and more.",
  faqItems: [
    {
      id: "account-setup",
      question: "How do I create a Trackit account?",
      answer:
        "Visit the sign-up page and register with your email and password, or sign in instantly with Google. After verifying your email, you'll be guided through a quick onboarding flow to set your currency, language, and notification preferences.",
    },
    {
      id: "transactions",
      question: "How do I track and import transactions?",
      answer:
        "You can add transactions manually, or bulk import them via CSV file with automatic column mapping. Trackit's AI will categorize imported transactions for you. You can also scan receipts using the built-in OCR powered by Google Gemini, which extracts the merchant, amount, and date automatically.",
    },
    {
      id: "budgets",
      question: "How does budgeting work in Trackit?",
      answer:
        "Create budgets for any spending category with daily, weekly, monthly, or yearly periods. Trackit tracks your spending in real time and sends you email alerts when you reach 70%, 90%, or 100% of your budget. Parent category budgets automatically include subcategory spending.",
    },
    {
      id: "ai-features",
      question: "What AI features does Trackit offer?",
      answer:
        "Trackit uses Google Gemini to provide smart transaction categorization, spending insights and trend analysis, anomaly detection for unusual spending, receipt OCR scanning, budget recommendations, and personalized financial advice. AI insights are also delivered to your inbox every few days if enabled.",
    },
    {
      id: "splits",
      question: "How do I split expenses with friends or roommates?",
      answer:
        "Create a group, add your contacts as members, then log shared expenses. Trackit supports four split methods: equal, exact amounts, percentage, and shares-based. The app calculates who owes whom and simplifies debts to minimize the number of payments needed to settle up.",
    },
    {
      id: "reports",
      question: "Can I get automated financial reports?",
      answer:
        "Yes. Trackit automatically generates and emails you a weekly spending digest every Monday and a detailed monthly summary on the first of each month. You can also manually generate reports from the Reports page and resend any previous report to your inbox.",
    },
    {
      id: "security",
      question: "How does Trackit protect my data?",
      answer:
        "Trackit uses secure session management via Better Auth, email verification for all accounts, and rate limiting to prevent brute-force attacks. All data is scoped to your user account with strict server-side authorization on every API call.",
    },
    {
      id: "settings",
      question: "Can I customize how amounts and dates are displayed?",
      answer:
        "Absolutely. In Settings, you can configure your preferred currency, language, date format, time format, currency symbol position, thousand separator style, decimal places, and compact number display. These preferences apply across your entire dashboard.",
    },
  ],
};

export default help;
