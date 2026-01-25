-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'CASH', 'BANK_TRANSFER', 'AUTO_DEBIT', 'UPI', 'OTHER');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "paymentMethod" "PaymentMethod";
