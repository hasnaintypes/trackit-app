import type { ChangelogContent } from "@/types/site";

const changelog: ChangelogContent = {
  entries: [
    {
      date: "Oct 20, 2025",
      version: "0.1.3",
      badges: ["New Features", "Design"],
      newFeatures: [
        "Completed all public-facing Marketing UI Pages (Hero, Features, FAQ).",
        "Launched the Changelog and Blog sections with initial content focused on AI and security.",
        "Implemented foundational UI/UX elements, including responsive design and modular navigation.",
      ],
      improvements: [
        "Refined Tailwind CSS configuration and theme management.",
        "Optimistic UI structure prepared for transaction and settlement actions.",
      ],
      // image: {
      //   src: "/marketing-ui.png",
      //   alt: "Screenshot of the Cashio marketing homepage",
      //   width: 600,
      //   height: 400,
      // },
    },
    {
      date: "Oct 15, 2025",
      version: "0.1.2",
      badges: ["Security", "Infrastructure"],
      newFeatures: [
        "Initial setup of the robust Authentication & Security Layer.",
        "Integrated Better Auth handling for OAuth (Google, GitHub) and passwordless logins.",
        "Core structure for Role-Based Access Control (RBAC) (User, Admin) defined.",
        "Implemented initial middleware for Two-Factor Authentication (2FA) and recovery codes.",
      ],
      improvements: [
        "Configured secure cookie sessions and initial rate limiting hooks (Arcjet).",
      ],
      bugfixes: [
        "Resolved environment variable loading issues in the T3 stack setup.",
      ],
    },
    {
      date: "Oct 08, 2025",
      version: "0.1.1",
      badges: ["Setup", "Infrastructure"],
      newFeatures: [
        "Project Initialized using the T3 Stack (Next.js, tRPC, Prisma, Tailwind).",
        "Database schema established for core entities (Users, Accounts, Transactions).",
      ],
      improvements: [
        "Configured environment for seamless development and deployment.",
        "Set up initial CI/CD pipelines.",
      ],
    },
  ],
};

export { changelog };
