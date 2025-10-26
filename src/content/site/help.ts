import type { HelpContent } from "@/types/site";

const help: HelpContent = {
  searchPlaceholder: "Search guides, topics, or troubleshooting tips",
  cards: [
    {
      title: "Getting Started & Account Setup",
      description:
        "Learn how to set up Cashio, link accounts using Plaid/OAuth, and activate Multi-Currency tracking.",
      linkText: "Read guide",
      href: "/docs/getting-started",
    },
    {
      title: "AI Insights, Budgeting & Reports",
      description:
        "Master Goal-Based Budgeting, understand your AI Spending Summaries, and use Gemini OCR for receipt scanning.",
      linkText: "See details",
      href: "/docs/transactions", // Keeping the original link
    },
    {
      title: "Group Collaboration & Settlements",
      description:
        "Set up groups, track shared expenses, split bills by percentage, and use Stripe Polar for instant settlements.",
      linkText: "Learn more",
      href: "/docs/security", // Keeping the original link
    },
  ],
  faqItems: [
    {
      id: "account-setup",
      question: "How do I create a Cashio account?",
      answer:
        "Visit the sign-up page and follow the guided setup. You have flexible options, including using OAuth (Google, GitHub) or our secure passwordless login for quick and authenticated access. Cashio also utilizes Better Auth to integrate with email-based OTPs for better security during setup or recovery.",
    },
    {
      id: "transactions",
      question: "How do I use the AI and OCR features for financial tracking?",
      answer:
        "Cashio's AI (Gemini/OpenAI) is integrated into several features. It provides predictive modeling for upcoming bills or savings gaps and anomaly detection for unusual spending. You can also use Gemini OCR directly in the transaction view to simply snap a photo of a receipt; the system instantly reads the merchant, amount, and date, then uses AI to categorize the transaction for you, virtually eliminating manual data entry.",
    },
    {
      id: "security",
      question:
        "How does Cashio protect my financial information and personal data?",
      answer:
        "Security is paramount. Cashio uses bank-grade encryption for data storage, secure cookies for session management, and robust Two-Factor Authentication (2FA) for all user accounts. We employ Role-Based Access Control (RBAC) to enforce permissions, track all sensitive actions via Audit logs, and utilize Arcjet for rate limiting and preventing unauthorized access attempts.",
    },
    {
      id: "multi-currency",
      question:
        "Does Cashio support multiple currencies, and how does it handle conversions?",
      answer:
        "Yes, Cashio fully supports multi-currency tracking. You can manage multiple accounts and wallets in different currencies. The system automatically fetches and applies real-time exchange rate conversions when viewing your total net worth or running reports, ensuring your financial picture is always accurate regardless of where your money is held.",
    },
    {
      id: "group-settlements",
      question:
        "What is Stripe Polar, and how does it help with group settlements?",
      answer:
        "Stripe Polar is the payment technology integrated directly into Cashio to facilitate instant peer-to-peer (P2P) transfers and wallet-to-wallet transactions. After tracking shared expenses, Cashio provides settlement suggestions. You can then use Stripe Polar to execute these transfers immediately within the app to settle debts with group members, making the process fast and effortless.",
    },
    {
      id: "alerts-and-notifications",
      question: "How do I set up custom alerts and get financial reports?",
      answer:
        "Cashio offers a robust notification system. You can set Customizable Notification Rulesfor example, 'notify me if dining spending exceeds $200'for immediate budget breach alerts or unusual activity. Furthermore, you can schedule monthly reports (containing full visual analytics and summaries) to be automatically delivered to your email.",
    },
  ],
};

export default help;
