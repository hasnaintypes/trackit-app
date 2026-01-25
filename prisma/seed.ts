import { PrismaClient, CategoryType } from "@prisma/client";
import fs from "fs";
import path from "path";

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const CATEGORIES_PATH = path.join(process.cwd(), "public/seed/categories.json");

// Define interface for the clean category structure (recursive)
interface SeedCategory {
  name: string;
  color: string;
  icon: string;
  type: string;
  sortOrder: number;
  subcategories: SeedCategory[];
}

async function main() {
  console.log("Seeding categories...");

  if (!fs.existsSync(CATEGORIES_PATH)) {
    console.error(`File not found: ${CATEGORIES_PATH}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(CATEGORIES_PATH, "utf-8");
  const categories = JSON.parse(rawData) as SeedCategory[];

  // Find a user to assign categories to
  // For now, we'll try to find the first user, or create a default one if needed?
  // User request: "help me seed it in the categories table".
  // Assuming there is at least one user or the user will log in.
  // Actually, categories are usually user-specific in this schema.
  // Check if I can find ANY user.
  const user = await prisma.user.findFirst();

  if (!user) {
    console.error("No user found in database. Please create a user first.");
    // Optional: Create a dummy user? No, safer to ask user to have a user.
    process.exit(1);
  }

  console.log(`Seeding categories for user: ${user.email} (${user.id})`);

  // Recursive function to create categories
  async function createCategory(
    cat: SeedCategory,
    parentId: string | null = null,
  ) {
    // Map string type to Enum
    let type: CategoryType = CategoryType.EXPENSE;
    if (cat.type === "INCOME") type = CategoryType.INCOME;
    else if (cat.type === "TRANSFER") type = CategoryType.TRANSFER;

    const created = await prisma.category.create({
      data: {
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        type: type,
        sortOrder: cat.sortOrder,
        userId: user!.id,
        parentCategoryId: parentId,
      },
    });

    if (cat.subcategories && cat.subcategories.length > 0) {
      for (const sub of cat.subcategories) {
        await createCategory(sub, created.id);
      }
    }
  }

  // Clear existing categories for this user?
  // Maybe just add new ones. But to avoid duplicates if run multiple times?
  // For now, we will just create. User logic seems to imply a fresh start or specific seeding task.
  // Using upsert is hard with tree structure without unique identifiers (name is not unique globally, constrained by parent?).
  // Schema doesn't enforce unique name per user.
  // We'll just create.

  for (const cat of categories) {
    await createCategory(cat, null);
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
