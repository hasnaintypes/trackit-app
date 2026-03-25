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

// ─── Split-related seed data ─────────────────────────────────────────

const CONTACT_TEMPLATES = [
  { name: "Sarah Johnson", email: "sarah.j@email.com", phone: "+1-555-0101" },
  { name: "Mike Chen", email: "mike.chen@email.com", phone: "+1-555-0102" },
  { name: "Emily Davis", email: "emily.d@email.com", phone: "+1-555-0103" },
  { name: "Alex Wilson", email: "alex.w@email.com", phone: "+1-555-0104" },
  { name: "Priya Patel", email: "priya.p@email.com", phone: "+1-555-0105" },
  { name: "James Brown", email: "james.b@email.com", phone: "+1-555-0106" },
];

const GROUP_TEMPLATES = [
  {
    name: "Apartment 4B",
    description: "Monthly apartment expenses",
    type: "ROOMMATES" as const,
    icon: "Home",
    color: "#6366f1",
    contactIndices: [0, 1], // Sarah, Mike
  },
  {
    name: "Bangkok Trip 2026",
    description: "Our Thailand vacation",
    type: "TRIP" as const,
    icon: "Plane",
    color: "#f59e0b",
    contactIndices: [2, 3, 4], // Emily, Alex, Priya
  },
  {
    name: "Friday Lunches",
    description: "Weekly team lunch splits",
    type: "WORK" as const,
    icon: "Utensils",
    color: "#22c55e",
    contactIndices: [5, 2], // James, Emily
  },
];

interface ExpenseTemplate {
  groupIdx: number;
  description: string;
  amount: number;
  splitMethod: "EQUAL" | "EXACT" | "PERCENTAGE" | "SHARES";
  payerContactIdx: number | null; // null = self
  daysAgo: number;
  customValues?: (number | undefined)[]; // for PERCENTAGE/EXACT/SHARES - one per participant including self
}

// Expenses spread across recent months for realistic data
const SPLIT_EXPENSE_TEMPLATES: ExpenseTemplate[] = [
  // ── Apartment 4B (3 members: self + Sarah + Mike) ──
  {
    groupIdx: 0,
    description: "March Rent",
    amount: 1800,
    splitMethod: "EQUAL",
    payerContactIdx: null,
    daysAgo: 5,
  },
  {
    groupIdx: 0,
    description: "February Rent",
    amount: 1800,
    splitMethod: "EQUAL",
    payerContactIdx: null,
    daysAgo: 35,
  },
  {
    groupIdx: 0,
    description: "Electricity Bill",
    amount: 126.5,
    splitMethod: "EQUAL",
    payerContactIdx: 0,
    daysAgo: 8,
  },
  {
    groupIdx: 0,
    description: "Groceries - Costco",
    amount: 185.3,
    splitMethod: "EQUAL",
    payerContactIdx: null,
    daysAgo: 3,
  },
  {
    groupIdx: 0,
    description: "Internet Bill",
    amount: 59.99,
    splitMethod: "EQUAL",
    payerContactIdx: 1,
    daysAgo: 12,
  },
  {
    groupIdx: 0,
    description: "Cleaning Supplies",
    amount: 42.75,
    splitMethod: "EQUAL",
    payerContactIdx: null,
    daysAgo: 15,
  },
  {
    groupIdx: 0,
    description: "Water Bill",
    amount: 38.0,
    splitMethod: "EQUAL",
    payerContactIdx: 0,
    daysAgo: 20,
  },
  {
    groupIdx: 0,
    description: "Groceries - Trader Joes",
    amount: 94.2,
    splitMethod: "EQUAL",
    payerContactIdx: 1,
    daysAgo: 7,
  },
  {
    groupIdx: 0,
    description: "Couch Repair",
    amount: 250.0,
    splitMethod: "SHARES",
    payerContactIdx: null,
    daysAgo: 25,
    customValues: [2, 1, 1],
  },
  {
    groupIdx: 0,
    description: "January Rent",
    amount: 1800,
    splitMethod: "EQUAL",
    payerContactIdx: null,
    daysAgo: 65,
  },

  // ── Bangkok Trip (4 members: self + Emily + Alex + Priya) ──
  {
    groupIdx: 1,
    description: "Hotel - 3 Nights",
    amount: 480.0,
    splitMethod: "EQUAL",
    payerContactIdx: null,
    daysAgo: 14,
  },
  {
    groupIdx: 1,
    description: "Street Food Tour",
    amount: 120.0,
    splitMethod: "EQUAL",
    payerContactIdx: 2,
    daysAgo: 13,
  },
  {
    groupIdx: 1,
    description: "Taxi to Airport",
    amount: 35.0,
    splitMethod: "EQUAL",
    payerContactIdx: 3,
    daysAgo: 11,
  },
  {
    groupIdx: 1,
    description: "Grand Palace Tickets",
    amount: 80.0,
    splitMethod: "EQUAL",
    payerContactIdx: null,
    daysAgo: 12,
  },
  {
    groupIdx: 1,
    description: "Shopping at Chatuchak",
    amount: 220.0,
    splitMethod: "PERCENTAGE",
    payerContactIdx: null,
    daysAgo: 13,
    customValues: [40, 25, 20, 15],
  },
  {
    groupIdx: 1,
    description: "Thai Massage",
    amount: 96.0,
    splitMethod: "EQUAL",
    payerContactIdx: 2,
    daysAgo: 12,
  },
  {
    groupIdx: 1,
    description: "Dinner at Gaggan",
    amount: 340.0,
    splitMethod: "EQUAL",
    payerContactIdx: null,
    daysAgo: 11,
  },
  {
    groupIdx: 1,
    description: "Boat Tour",
    amount: 160.0,
    splitMethod: "EQUAL",
    payerContactIdx: 3,
    daysAgo: 13,
  },
  {
    groupIdx: 1,
    description: "Snorkeling Day Trip",
    amount: 280.0,
    splitMethod: "EQUAL",
    payerContactIdx: null,
    daysAgo: 10,
  },
  {
    groupIdx: 1,
    description: "Travel Insurance",
    amount: 200.0,
    splitMethod: "EXACT",
    payerContactIdx: null,
    daysAgo: 30,
    customValues: [60, 50, 50, 40],
  },

  // ── Friday Lunches (3 members: self + James + Emily) ──
  {
    groupIdx: 2,
    description: "Pizza at Luigi's",
    amount: 48.5,
    splitMethod: "EQUAL",
    payerContactIdx: null,
    daysAgo: 2,
  },
  {
    groupIdx: 2,
    description: "Sushi Platter",
    amount: 67.8,
    splitMethod: "EQUAL",
    payerContactIdx: 5,
    daysAgo: 9,
  },
  {
    groupIdx: 2,
    description: "Thai Takeout",
    amount: 38.4,
    splitMethod: "EQUAL",
    payerContactIdx: 2,
    daysAgo: 16,
  },
  {
    groupIdx: 2,
    description: "Burger Joint",
    amount: 42.0,
    splitMethod: "EQUAL",
    payerContactIdx: null,
    daysAgo: 23,
  },
  {
    groupIdx: 2,
    description: "Indian Buffet",
    amount: 54.0,
    splitMethod: "EQUAL",
    payerContactIdx: 5,
    daysAgo: 30,
  },
  {
    groupIdx: 2,
    description: "Taco Tuesday",
    amount: 33.6,
    splitMethod: "EQUAL",
    payerContactIdx: null,
    daysAgo: 37,
  },
  {
    groupIdx: 2,
    description: "Poke Bowl",
    amount: 45.9,
    splitMethod: "EQUAL",
    payerContactIdx: 2,
    daysAgo: 44,
  },
  {
    groupIdx: 2,
    description: "Vietnamese Pho",
    amount: 36.0,
    splitMethod: "EQUAL",
    payerContactIdx: null,
    daysAgo: 51,
  },
];

interface SettlementTemplate {
  groupIdx: number;
  fromContactIdx: number | null; // null = self
  toContactIdx: number | null; // null = self
  amount: number;
  daysAgo: number;
  notes?: string;
}

const SETTLEMENT_TEMPLATES: SettlementTemplate[] = [
  // Apartment: Mike partially settled up for rent
  {
    groupIdx: 0,
    fromContactIdx: 1,
    toContactIdx: null,
    amount: 600,
    daysAgo: 28,
    notes: "January rent share",
  },
  {
    groupIdx: 0,
    fromContactIdx: 1,
    toContactIdx: null,
    amount: 600,
    daysAgo: 4,
    notes: "February rent share",
  },
  // Apartment: Sarah partially settled up
  {
    groupIdx: 0,
    fromContactIdx: 0,
    toContactIdx: null,
    amount: 500,
    daysAgo: 30,
    notes: "January expenses",
  },
  // Bangkok Trip: self paid Emily back
  {
    groupIdx: 1,
    fromContactIdx: null,
    toContactIdx: 2,
    amount: 45,
    daysAgo: 9,
    notes: "For street food tour",
  },
  // Bangkok Trip: Priya settled
  {
    groupIdx: 1,
    fromContactIdx: 4,
    toContactIdx: null,
    amount: 200,
    daysAgo: 7,
    notes: "Trip settlement",
  },
  // Friday Lunches: James settled
  {
    groupIdx: 2,
    fromContactIdx: 5,
    toContactIdx: null,
    amount: 25,
    daysAgo: 6,
    notes: "Lunch catch-up",
  },
];

// ─── Main seed function ──────────────────────────────────────────────

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

  console.log(`Seeding data for user: ${user.email}`);

  const account = user.bankAccounts[0]!;
  const expenseCategories = user.categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = user.categories.filter((c) => c.type === "INCOME");

  // ── Clean up existing data (order matters for FK constraints) ──
  console.log("Cleaning up existing data...");
  await prisma.settlement.deleteMany({ where: { createdById: user.id } });
  await prisma.expenseParticipant.deleteMany({
    where: { expense: { createdById: user.id } },
  });
  await prisma.expense.deleteMany({ where: { createdById: user.id } });
  await prisma.groupMember.deleteMany({
    where: { group: { userId: user.id } },
  });
  await prisma.group.deleteMany({ where: { userId: user.id } });
  await prisma.contact.deleteMany({ where: { userId: user.id } });
  const deletedTxns = await prisma.transaction.deleteMany({
    where: { userId: user.id },
  });
  console.log(
    `Deleted ${deletedTxns.count} existing transactions + all splits data.`,
  );

  // ═══════════════════════════════════════════════════════════════════
  // PART 1: Seed transactions (same as before)
  // ═══════════════════════════════════════════════════════════════════

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

  const current = new Date(START_YEAR, START_MONTH, 1);
  while (
    current.getFullYear() < now.getFullYear() ||
    (current.getFullYear() === now.getFullYear() &&
      current.getMonth() <= now.getMonth())
  ) {
    const year = current.getFullYear();
    const month = current.getMonth();

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

  const txnResult = await prisma.transaction.createMany({ data: transactions });
  const monthCount =
    (now.getFullYear() - START_YEAR) * 12 + now.getMonth() - START_MONTH + 1;
  console.log(
    `Created ${txnResult.count} transactions across ${monthCount} months.`,
  );

  // ═══════════════════════════════════════════════════════════════════
  // PART 2: Seed contacts
  // ═══════════════════════════════════════════════════════════════════

  console.log("\nSeeding contacts...");
  const contacts: { id: string; name: string }[] = [];
  for (const tmpl of CONTACT_TEMPLATES) {
    const contact = await prisma.contact.create({
      data: {
        userId: user.id,
        name: tmpl.name,
        email: tmpl.email,
        phone: tmpl.phone,
      },
      select: { id: true, name: true },
    });
    contacts.push(contact);
  }
  console.log(`Created ${contacts.length} contacts.`);

  // ═══════════════════════════════════════════════════════════════════
  // PART 3: Seed groups + members
  // ═══════════════════════════════════════════════════════════════════

  console.log("Seeding groups...");
  const groups: {
    id: string;
    name: string;
    memberContactIds: (string | null)[];
  }[] = [];

  for (const tmpl of GROUP_TEMPLATES) {
    const group = await prisma.group.create({
      data: {
        userId: user.id,
        name: tmpl.name,
        description: tmpl.description,
        type: tmpl.type,
        icon: tmpl.icon,
        color: tmpl.color,
        currency: "USD",
      },
      select: { id: true, name: true },
    });

    // Owner member (self, contactId = null)
    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: user.id,
        contactId: null,
        role: "OWNER",
      },
    });

    // Contact members
    const memberContactIds: (string | null)[] = [null]; // self first
    for (const idx of tmpl.contactIndices) {
      const contact = contacts[idx]!;
      await prisma.groupMember.create({
        data: {
          groupId: group.id,
          userId: user.id,
          contactId: contact.id,
          role: "MEMBER",
        },
      });
      memberContactIds.push(contact.id);
    }

    groups.push({ id: group.id, name: group.name, memberContactIds });
  }
  console.log(`Created ${groups.length} groups with members.`);

  // ═══════════════════════════════════════════════════════════════════
  // PART 4: Seed expenses with participants
  // ═══════════════════════════════════════════════════════════════════

  console.log("Seeding expenses...");
  let expenseCount = 0;

  for (const tmpl of SPLIT_EXPENSE_TEMPLATES) {
    const group = groups[tmpl.groupIdx]!;
    const memberContactIds = group.memberContactIds; // [null, contactId1, contactId2, ...]
    const numMembers = memberContactIds.length;
    const expenseDate = new Date(now.getTime() - tmpl.daysAgo * 86400000);

    // Determine the payer's contactId
    const payerContactId =
      tmpl.payerContactIdx !== null ? contacts[tmpl.payerContactIdx]!.id : null; // null = self

    // Calculate owedAmount per participant based on split method
    let owedAmounts: number[];
    switch (tmpl.splitMethod) {
      case "EQUAL": {
        const base = Math.floor((tmpl.amount / numMembers) * 100) / 100;
        const remainder =
          Math.round((tmpl.amount - base * numMembers) * 100) / 100;
        owedAmounts = memberContactIds.map((_, i) =>
          i === 0 ? base + remainder : base,
        );
        break;
      }
      case "PERCENTAGE": {
        const pcts = tmpl.customValues!;
        owedAmounts = pcts.map(
          (pct) => Math.round(tmpl.amount * ((pct ?? 0) / 100) * 100) / 100,
        );
        // Adjust rounding
        const sum = owedAmounts.reduce((a, b) => a + b, 0);
        const diff = Math.round((tmpl.amount - sum) * 100) / 100;
        if (diff !== 0)
          owedAmounts[0] = Math.round((owedAmounts[0]! + diff) * 100) / 100;
        break;
      }
      case "EXACT": {
        owedAmounts = tmpl.customValues!.map((v) => v ?? 0);
        break;
      }
      case "SHARES": {
        const shares = tmpl.customValues!;
        const totalShares = shares.reduce((a: number, b) => a + (b ?? 1), 0);
        owedAmounts = shares.map(
          (s) =>
            Math.round(tmpl.amount * ((s ?? 1) / (totalShares || 1)) * 100) /
            100,
        );
        const sum = owedAmounts.reduce((a, b) => a + b, 0);
        const diff = Math.round((tmpl.amount - sum) * 100) / 100;
        if (diff !== 0)
          owedAmounts[0] = Math.round((owedAmounts[0]! + diff) * 100) / 100;
        break;
      }
    }

    // Pick a random expense category if available
    const category =
      expenseCategories.length > 0 ? pickRandom(expenseCategories) : null;

    const expense = await prisma.expense.create({
      data: {
        groupId: group.id,
        createdById: user.id,
        description: tmpl.description,
        amount: tmpl.amount,
        currency: "USD",
        categoryId: category?.id ?? null,
        date: expenseDate,
        splitMethod: tmpl.splitMethod,
      },
      select: { id: true },
    });

    // Create participants
    const participantData = memberContactIds.map((contactId, i) => {
      const isPayer = contactId === payerContactId;
      return {
        expenseId: expense.id,
        contactId,
        isPayer,
        paidAmount: isPayer ? tmpl.amount : 0,
        owedAmount: owedAmounts[i]!,
      };
    });

    await prisma.expenseParticipant.createMany({ data: participantData });
    expenseCount++;
  }
  console.log(`Created ${expenseCount} expenses with participants.`);

  // ═══════════════════════════════════════════════════════════════════
  // PART 5: Seed settlements
  // ═══════════════════════════════════════════════════════════════════

  console.log("Seeding settlements...");
  let settlementCount = 0;

  for (const tmpl of SETTLEMENT_TEMPLATES) {
    const group = groups[tmpl.groupIdx]!;
    const settlementDate = new Date(now.getTime() - tmpl.daysAgo * 86400000);

    const fromContactId =
      tmpl.fromContactIdx !== null ? contacts[tmpl.fromContactIdx]!.id : null;
    const toContactId =
      tmpl.toContactIdx !== null ? contacts[tmpl.toContactIdx]!.id : null;

    await prisma.settlement.create({
      data: {
        groupId: group.id,
        createdById: user.id,
        fromContactId,
        toContactId,
        amount: tmpl.amount,
        currency: "USD",
        date: settlementDate,
        notes: tmpl.notes,
      },
    });
    settlementCount++;
  }
  console.log(`Created ${settlementCount} settlements.`);

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
