-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('MONTHLY_SUMMARY', 'WEEKLY_DIGEST', 'BUDGET_EXCEEDED', 'SPENDING_INSIGHTS');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "period" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "data" JSONB NOT NULL,
    "emailSentTo" TEXT,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reports_userId_idx" ON "reports"("userId");

-- CreateIndex
CREATE INDEX "reports_type_idx" ON "reports"("type");

-- CreateIndex
CREATE INDEX "reports_period_idx" ON "reports"("period");

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
