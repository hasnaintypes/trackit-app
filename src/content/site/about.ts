import type {
  AboutContent,
  AboutHero,
  StatsSectionContent,
  FAQSectionContent,
} from "@/types/site";

export const hero: AboutHero = {
  title: "Smarter money, simplified.",
  subtitle: "Manage finances with ease.",
  description:
    "Trackit helps you track spending, automate budgets with smart AI, and settle group expenses quicklysecurely and collaboratively.",
  image:
    "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1331",
};

export const stats: StatsSectionContent = {
  heading: "Empowering smarter money decisions every day",
  items: [
    {
      label: "Active Users",
      value: "25k+",
      description:
        "Individuals and teams managing their finances with Trackit.",
    },
    {
      label: "Tracked Transactions",
      value: "2M+",
      description:
        "Securely processed and categorized with real-time insights.",
    },
    {
      label: "Automations Run",
      value: "500k+",
      description:
        "Recurring payments, reports, and AI routines executed monthly.",
    },
    {
      label: "Currencies Supported",
      value: "120+",
      description: "Global coverage with live exchange rates and conversions.",
    },
  ],
};

export const faq: FAQSectionContent = {
  heading: "Frequently Asked Questions",
  items: [
    {
      question: "How does Trackit ensure my financial data is secure?",
      answer:
        "Security is our top priority. We use bank-grade encryption, secure cookie sessions, and strong authentication methods like Two-Factor Authentication (2FA) and passwordless login (Better Auth). All sensitive actions are recorded in an Audit Log, and we enforce Role-Based Access Control (RBAC) to ensure data privacy.",
    },
    {
      question:
        "What is the difference between the Free, Pro, and Enterprise plans?",
      answer:
        "The Free plan covers core personal finance features. Pro unlocks premium features like custom report builders, advanced AI insights, and unlimited group collaboration. Enterprise is for businesses and includes full Admin Dashboard access, dedicated support, and advanced RBAC.",
    },
    {
      question: "How does the AI feature work to give me insights?",
      answer:
        "Trackit uses AI (powered by Gemini/OpenAI) for several features: Predictive Modeling for future bills and savings gaps, Anomaly Detection for unusual spending, and intelligent categorization. It also provides Monthly/Weekly AI Spending Summaries and identifies your top savings opportunities.",
    },
    {
      question:
        "Can I use Trackit to manage shared expenses with friends or family?",
      answer:
        "Absolutely. Our Group & Collaboration System allows you to create groups, track shared expenses, and automatically split bills by amount or percentage. It even provides smart settlement suggestions and allows instant balance transfers P2P via Stripe Polar.",
    },
    {
      question: "How does Trackit handle receipts and data entry?",
      answer:
        "We make data entry effortless. You can simply use your phone's camera to scan a receipt. Our built-in Gemini OCR technology reads the text, extracts the merchant, amount, and date, and uses AI to automatically categorize the transaction.",
    },
  ],
};

export const aboutContent: AboutContent = {
  hero,
  stats,
  faq,
};

export default aboutContent;
