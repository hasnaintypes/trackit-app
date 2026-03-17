import {
  WalletIcon,
  UsersIcon,
  LineChartIcon,
  ShieldCheckIcon,
  BellIcon,
  LockIcon,
} from "lucide-react";
import type {
  FeatureItem,
  HeroContent,
  ContentSectionContent,
  IntegrationContent,
  Plan,
  Testimonial,
  HomeContent,
} from "@/types/site";

export const featuresList: FeatureItem[] = [
  {
    icon: WalletIcon,
    title: "Unified Finance Dashboard",
    description:
      "Manage multiple accounts, budgets, and currencies in one place. Track income, expenses, and transfers effortlessly with smart categorization.",
    cardBorderColor: "border-primary/40 hover:border-primary",
    avatarTextColor: "text-primary",
    avatarBgColor: "bg-primary/10",
  },
  {
    icon: UsersIcon,
    title: "Group Collaboration",
    description:
      "Create groups, split bills, and settle balances in real time. Manage shared expenses with transparent summaries and instant updates.",
    cardBorderColor:
      "border-green-600/40 hover:border-green-600 dark:border-green-400/40 dark:hover:border-green-400",
    avatarTextColor: "text-green-600 dark:text-green-400",
    avatarBgColor: "bg-green-600/10 dark:bg-green-400/10",
  },
  {
    icon: LineChartIcon,
    title: "AI Insights & Analytics",
    description:
      "Discover spending trends, predict bills, and get personalized saving tips. Trackit’s AI helps you make smarter financial decisions every day.",
    cardBorderColor:
      "border-amber-600/40 hover:border-amber-600 dark:border-amber-400/40 dark:hover:border-amber-400",
    avatarTextColor: "text-amber-600 dark:text-amber-400",
    avatarBgColor: "bg-amber-600/10 dark:bg-amber-400/10",
  },
  {
    icon: ShieldCheckIcon,
    title: "Enterprise-Grade Security",
    description:
      "Your data is encrypted end-to-end with 2FA, secure sessions, and detailed audit logs. Built with compliance and trust at its core.",
    cardBorderColor: "border-destructive/40 hover:border-destructive",
    avatarTextColor: "text-destructive",
    avatarBgColor: "bg-destructive/10",
  },
  {
    icon: BellIcon,
    title: "Smart Alerts & Automation",
    description:
      "Get notified when you overspend, hit a goal, or have bills due. Automate recurring payments and reports without lifting a finger.",
    cardBorderColor:
      "border-sky-600/40 hover:border-sky-600 dark:border-sky-400/40 dark:hover:border-sky-400",
    avatarTextColor: "text-sky-600 dark:text-sky-400",
    avatarBgColor: "bg-sky-600/10 dark:bg-sky-400/10",
  },
  {
    icon: LockIcon,
    title: "Seamless Stripe Integration",
    description:
      "Enjoy instant top-ups, peer-to-peer transfers, and subscription management powered by Stripe  securely and transparently.",
    cardBorderColor: "border-primary/40 hover:border-primary",
    avatarTextColor: "text-primary",
    avatarBgColor: "bg-primary/10",
  },
];

export const hero: HeroContent = {
  badgeText: "Now Live  Trackit v1.0",
  title: "Your Smartest Way to Manage Money, Together",
  description:
    "Trackit unifies personal and group finance in one intelligent dashboard. Track spending, split bills, set goals, and let AI guide your next move all in real time.",
  primaryCta: { href: "/sign-in", text: "Get Started Free" },
  secondaryCta: { text: "See How It Works" },
};

export const contentSection: ContentSectionContent = {
  heading: "The Trackit ecosystem powers smarter finance.",
  paragraphs: [
    "Trackit isn’t just another finance app  it’s a complete ecosystem built for individuals, teams, and businesses to manage money intelligently.",
    "From real-time collaboration and AI-driven insights to secure payments and seamless automation, Trackit connects every part of your financial life.",
  ],
  bullets: [
    {
      title: "Intelligent",
      body: "AI summarizes your spending, predicts bills, and finds saving opportunities before you miss them.",
    },
    {
      title: "Connected",
      body: "Sync with tools you already use  from Google Sheets to Stripe and keep your finances always in sync.",
    },
  ],
};

export const integrations: IntegrationContent = {
  heading: "Connect Trackit with your favorite tools",
  description:
    "Integrate with Plaid, Notion, Google Sheets, and Stripe to automate your workflow. Build custom extensions and automate reports with our API and webhooks.",
  cta: { href: "/sign-in", text: "Get Started Free" },
};

export const pricing = {
  plans: [
    {
      name: "Starter",
      price: 19,
      description:
        "Manage your personal budget and track spending with real-time AI insights.",
      features: [
        "5 accounts included",
        "Smart spend tracking",
        "AI monthly summary",
        "Email alerts & reports",
        "Basic support access",
      ],
      buttonText: "Start managing your budget",
    },
    {
      name: "Pro",
      price: 29,
      isRecommended: true,
      description:
        "Collaborate with friends and automate group expenses using smart analytics.",
      features: [
        "10 accounts included",
        "Group collaboration tools",
        "AI spend prediction",
        "Automated settlements",
        "Priority chat support",
      ],
      buttonText: "Upgrade to Trackit Pro",
      isPopular: true,
    },
    {
      name: "Enterprise",
      price: 49,
      description:
        "Unlock full control with advanced AI, admin tools, and custom integrations.",
      features: [
        "Unlimited accounts access",
        "Role-based permissions",
        "Stripe billing reports",
        "Custom webhook support",
        "Dedicated success team",
      ],
      buttonText: "Get Trackit Enterprise",
    },
  ] as Plan[],
};

export const testimonials: Testimonial[] = [
  {
    name: "Jonathan Yombo",
    role: "Freelance Finance Consultant",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    quote:
      "Trackit is really extraordinary and very practical, no need to think twice. A real gold mine.",
  },
  {
    name: "Yves Kalume",
    role: "Product Manager at Finlytics",
    image: "https://randomuser.me/api/portraits/men/6.jpg",
    quote:
      "With no experience in finance apps I organized my budgets in minutes with Trackit's AI  truly effortless.",
  },
  {
    name: "Yucel Faruksahan",
    role: "UX Designer",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    quote:
      "Great work on Trackit's dashboard. This is one of the best finance UIs that I have seen so far :)",
  },
  {
    name: "Anonymous author",
    role: "Everyday User",
    image: "https://randomuser.me/api/portraits/men/8.jpg",
    quote:
      "I am new to finance apps and wanted something simple. I searched a lot and Trackit gave a clear view without complexity. The onboarding was easy to follow and fit my needs perfectly.",
  },
  {
    name: "Shekinah Tshiokufila",
    role: "Senior Software Engineer",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    quote:
      "Trackit is redefining finance apps, providing efficient tools for those who value simplicity but need power. I highly recommend it.",
  },
  {
    name: "Oketa Fred",
    role: "Fullstack Developer",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    quote:
      "I absolutely love Trackit! The components are beautifully designed and easy to use, making finance management a breeze.",
  },
  {
    name: "Zeki",
    role: "Founder of ChatExtend",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
    quote:
      "Using Trackit felt like unlocking a finance superpower. The blend of simplicity and power lets us build workflows that are both elegant and practical.",
  },
  {
    name: "Joseph Kitheka",
    role: "Fullstack Developer",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    quote:
      "Trackit has transformed how I manage apps. Its set of components and templates accelerated our setup. The flexibility to customize allowed unique experiences. Trackit is a game-changer!",
  },
  {
    name: "Khatab Wedaa",
    role: "Product Designer",
    image: "https://randomuser.me/api/portraits/men/10.jpg",
    quote:
      "Trackit is elegant, clean, and responsive  very helpful to get a finance product started quickly.",
  },
  {
    name: "Rodrigo Aguilar",
    role: "UI/UX Creator",
    image: "https://randomuser.me/api/portraits/men/11.jpg",
    quote:
      "I love Trackit. The UI blocks are well-structured, simple to use, and beautifully designed. It makes launching a finance app fast.",
  },
  {
    name: "Eric Ampire",
    role: "Mobile Engineer",
    image: "https://randomuser.me/api/portraits/men/12.jpg",
    quote:
      "Trackit templates are perfect for anyone building a finance app without design experience. They are easy to use, customizable, and responsive. Highly recommended.",
  },
  {
    name: "Roland Tubonge",
    role: "Software Engineer",
    image: "https://randomuser.me/api/portraits/men/13.jpg",
    quote:
      "Trackit is so well designed that even without deep design knowledge you can do great things. Let it surprise you!",
  },
];

export const homeContent: HomeContent = {
  featuresList,
  hero,
  contentSection,
  integrations,
  pricing,
  testimonials,
};
