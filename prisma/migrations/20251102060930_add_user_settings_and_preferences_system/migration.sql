/*
  Warnings:

  - The `role` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CurrencyPosition" AS ENUM ('BEFORE', 'AFTER');

-- CreateEnum
CREATE TYPE "ThousandSeparator" AS ENUM ('COMMA', 'SPACE', 'NONE');

-- CreateEnum
CREATE TYPE "ColorScheme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "DefaultView" AS ENUM ('OVERVIEW', 'TRANSACTIONS', 'NETWORTH', 'PORTFOLIO');

-- CreateEnum
CREATE TYPE "TimeFormat" AS ENUM ('H12', 'H24');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'SGD');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('EN', 'ES', 'FR', 'DE', 'IT', 'PT', 'JA', 'ZH', 'KO', 'AR');

-- CreateEnum
CREATE TYPE "WeekDay" AS ENUM ('SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateEnum
CREATE TYPE "Timezone" AS ENUM ('UTC', 'EST', 'CST', 'MST', 'PST', 'GMT', 'CET', 'JST', 'AEST', 'IST');

-- CreateEnum
CREATE TYPE "Country" AS ENUM ('US', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'SG', 'IN', 'AE');

-- CreateEnum
CREATE TYPE "DateFormat" AS ENUM ('MM_DD_YYYY', 'DD_MM_YYYY', 'YYYY_MM_DD');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "country" "Country",
ADD COLUMN     "timezone" "Timezone",
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultCurrency" "Currency" NOT NULL DEFAULT 'USD',
    "language" "Language" NOT NULL DEFAULT 'EN',
    "dateFormat" "DateFormat" NOT NULL DEFAULT 'MM_DD_YYYY',
    "timeFormat" "TimeFormat" NOT NULL DEFAULT 'H12',
    "weekStartsOn" "WeekDay" NOT NULL DEFAULT 'SUNDAY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "display_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "defaultView" "DefaultView" NOT NULL DEFAULT 'OVERVIEW',
    "decimalPlaces" INTEGER NOT NULL DEFAULT 2,
    "currencyPosition" "CurrencyPosition" NOT NULL DEFAULT 'BEFORE',
    "thousandSeparator" "ThousandSeparator" NOT NULL DEFAULT 'COMMA',
    "colorScheme" "ColorScheme" NOT NULL DEFAULT 'SYSTEM',
    "compactNumbers" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "display_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailTransactions" BOOLEAN NOT NULL DEFAULT true,
    "emailBalanceAlerts" BOOLEAN NOT NULL DEFAULT true,
    "emailSecurity" BOOLEAN NOT NULL DEFAULT true,
    "emailMarketing" BOOLEAN NOT NULL DEFAULT false,
    "pushTransactions" BOOLEAN NOT NULL DEFAULT true,
    "pushBalanceAlerts" BOOLEAN NOT NULL DEFAULT true,
    "smsLargeTransactions" BOOLEAN NOT NULL DEFAULT true,
    "smsSecurity" BOOLEAN NOT NULL DEFAULT true,
    "lowBalanceThreshold" DECIMAL(10,2),
    "largeTransactionThreshold" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "display_settings_userId_key" ON "display_settings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "display_settings" ADD CONSTRAINT "display_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
