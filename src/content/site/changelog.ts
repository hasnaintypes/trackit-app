import type { ChangelogContent } from "@/types/site";

const changelog: ChangelogContent = {
  entries: [
    {
      date: "Mar 18, 2026",
      version: "1.2.0",
      badges: ["Performance", "Security", "Bug Fixes"],
      newFeatures: [
        "Transaction alert emails — get notified instantly when large or unusual transactions occur.",
        "Database indexes and constraints for faster queries across accounts, transactions, and budgets.",
      ],
      improvements: [
        "React.memo, useCallback, and Suspense boundaries across all dashboard pages for smoother navigation.",
        "Backend optimizations — database-level aggregations replace in-memory calculations, N+1 queries eliminated.",
        "Budget evaluation rewritten to batch process with ownership checks and threshold deduplication.",
        "Upgraded to Next.js 15.5 and React 19.2 for latest performance and stability improvements.",
      ],
      bugfixes: [
        "Fixed hydration mismatch on mobile detection with proper error boundaries.",
        "AI insights now strip raw API responses from errors and validate anomaly date ranges.",
        "Email templates improved with input validation, template whitelisting, and better error messages.",
        "Resolved Decimal serialization issues in settings and fixed client-side environment access errors.",
        "Auth rate limiting added to prevent brute-force login attempts.",
      ],
    },
    {
      date: "Mar 17, 2026",
      version: "1.1.0",
      badges: ["Features", "Dashboard", "AI"],
      newFeatures: [
        "Full dashboard with overview stats, percentage changes, and date range filtering.",
        "Account management — create, edit, and delete bank accounts with balance tracking.",
        "Transaction tracking with bulk import via CSV, recurring transaction rules, and receipt uploads.",
        "Hierarchical budgeting system with category-based spending limits and threshold alerts.",
        "AI-powered features — smart categorization, spending insights, anomaly detection, and receipt OCR.",
        "Automated reports — monthly summaries and budget exceeded reports delivered to your inbox.",
        "Settings pages for display preferences, notifications, profile, and regional configuration.",
        "Onboarding flow to personalize your experience on first sign-in.",
        "Streaming loading skeletons across all pages for a polished loading experience.",
        "Command palette for quick navigation across the app.",
      ],
      improvements: [
        "Bulk import dialog with column mapping, confirmation preview, and progress tracking.",
        "Enhanced charts with data validation, improved tooltips, and responsive styling.",
        "Profile management with avatar uploads, notification preferences, and security settings.",
        "Strict TypeScript configuration with additional compiler checks enabled.",
      ],
      bugfixes: [
        "Fixed account deletion handling and optimized dashboard transaction limits.",
        "Replaced deprecated api.useContext() with api.useUtils() across all hooks.",
        "Standardized notification titles and improved error logging throughout the app.",
        "Fixed balance formatting to include currency symbol and improved session handling.",
      ],
    },
    {
      date: "Oct 26, 2025",
      version: "1.0.0",
      badges: ["Launch", "Foundation"],
      newFeatures: [
        "Initial release of Trackit — personal finance tracking built with the T3 Stack.",
        "Authentication with email/password, email verification, and password reset flow.",
        "Marketing pages — homepage with hero, features showcase, pricing, and integrations section.",
        "About page with team stats, blog section, and FAQ.",
        "Help center with searchable FAQ and support resources.",
        "Blog with post details, comments, and sidebar navigation.",
        "Changelog page to track feature releases and updates.",
      ],
      improvements: [
        "Responsive design across all public-facing pages.",
        "Dark mode support with system preference detection.",
        "Database schema established for users, accounts, transactions, budgets, and categories.",
      ],
    },
  ],
};

export { changelog };
