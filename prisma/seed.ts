import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<
  typeof PrismaClient
>[0] & { adapter: unknown });

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(year: number, month: number): Date {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const day = Math.floor(Math.random() * daysInMonth) + 1;
  const hour = Math.floor(Math.random() * 14) + 8;
  return new Date(year, month, day, hour, 0, 0);
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

const EXPENSE_TEMPLATES = [
  { desc: "Grocery shopping", min: 30, max: 150 },
  { desc: "Electricity bill", min: 60, max: 180 },
  { desc: "Internet subscription", min: 40, max: 80 },
  { desc: "Gas station", min: 25, max: 70 },
  { desc: "Restaurant dinner", min: 20, max: 90 },
  { desc: "Coffee shop", min: 4, max: 12 },
  { desc: "Streaming subscription", min: 10, max: 20 },
  { desc: "Phone bill", min: 30, max: 60 },
  { desc: "Gym membership", min: 25, max: 50 },
  { desc: "Clothing purchase", min: 30, max: 200 },
  { desc: "Home supplies", min: 15, max: 80 },
  { desc: "Car insurance", min: 80, max: 200 },
  { desc: "Medical checkup", min: 50, max: 300 },
  { desc: "Uber ride", min: 8, max: 35 },
  { desc: "Online shopping", min: 15, max: 150 },
  { desc: "Water bill", min: 20, max: 60 },
  { desc: "Pet supplies", min: 20, max: 80 },
  { desc: "Book purchase", min: 10, max: 40 },
  { desc: "Movie tickets", min: 12, max: 30 },
  { desc: "Haircut", min: 15, max: 45 },
  { desc: "Parking fee", min: 5, max: 20 },
  { desc: "Lunch at work", min: 8, max: 18 },
  { desc: "Dentist visit", min: 100, max: 400 },
  { desc: "Home repair", min: 50, max: 500 },
  { desc: "Gift purchase", min: 20, max: 100 },
];

const INCOME_TEMPLATES = [
  { desc: "Monthly salary", min: 3000, max: 5000 },
  { desc: "Freelance payment", min: 200, max: 1500 },
  { desc: "Investment dividend", min: 50, max: 300 },
  { desc: "Side project income", min: 100, max: 800 },
  { desc: "Refund received", min: 20, max: 150 },
  { desc: "Cashback reward", min: 5, max: 50 },
];

const PAYMENT_METHODS = [
  "CARD",
  "CASH",
  "BANK_TRANSFER",
  "AUTO_DEBIT",
  "UPI",
] as const;

async function main() {
  const user = await prisma.user.findFirst({
    where: { bankAccounts: { some: {} } },
    include: {
      bankAccounts: true,
      categories: true,
    },
  });

  if (!user) {
    console.log("No user with a bank account found. Create a user first.");
    return;
  }

  console.log(`Seeding transactions for user: ${user.email}`);

  const account = user.bankAccounts[0]!;
  const expenseCategories = user.categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = user.categories.filter((c) => c.type === "INCOME");

  // Delete all existing transactions for clean seed
  const deleted = await prisma.transaction.deleteMany({
    where: { userId: user.id },
  });
  console.log(`Deleted ${deleted.count} existing transactions.`);

  const now = new Date();
  const START_YEAR = 2025;
  const START_MONTH = 0; // January (0-indexed)

  const transactions: {
    userId: string;
    accountId: string;
    categoryId: string | null;
    amount: number;
    type: "DEBIT" | "CREDIT";
    description: string;
    date: Date;
    paymentMethod:
      | "CARD"
      | "CASH"
      | "BANK_TRANSFER"
      | "AUTO_DEBIT"
      | "UPI"
      | "OTHER"
      | null;
  }[] = [];

  // Iterate from Jan 2025 to the current month
  const current = new Date(START_YEAR, START_MONTH, 1);
  while (
    current.getFullYear() < now.getFullYear() ||
    (current.getFullYear() === now.getFullYear() &&
      current.getMonth() <= now.getMonth())
  ) {
    const year = current.getFullYear();
    const month = current.getMonth();

    // 1-2 income transactions per month
    const incomeCount = Math.random() > 0.3 ? 2 : 1;
    for (let i = 0; i < incomeCount; i++) {
      const template = pickRandom(INCOME_TEMPLATES);
      const category =
        incomeCategories.length > 0 ? pickRandom(incomeCategories) : null;
      transactions.push({
        userId: user.id,
        accountId: account.id,
        categoryId: category?.id ?? null,
        amount: randomBetween(template.min, template.max),
        type: "CREDIT",
        description: template.desc,
        date: randomDate(year, month),
        paymentMethod: pickRandom(PAYMENT_METHODS),
      });
    }

    // 8-15 expense transactions per month
    const expenseCount = Math.floor(Math.random() * 8) + 8;
    for (let i = 0; i < expenseCount; i++) {
      const template = pickRandom(EXPENSE_TEMPLATES);
      const category =
        expenseCategories.length > 0 ? pickRandom(expenseCategories) : null;
      transactions.push({
        userId: user.id,
        accountId: account.id,
        categoryId: category?.id ?? null,
        amount: randomBetween(template.min, template.max),
        type: "DEBIT",
        description: template.desc,
        date: randomDate(year, month),
        paymentMethod: pickRandom(PAYMENT_METHODS),
      });
    }

    current.setMonth(current.getMonth() + 1);
  }

  const result = await prisma.transaction.createMany({
    data: transactions,
  });

  const monthCount =
    (now.getFullYear() - START_YEAR) * 12 + now.getMonth() - START_MONTH + 1;
  console.log(
    `Created ${result.count} transactions across ${monthCount} months (Jan 2025 - now).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
