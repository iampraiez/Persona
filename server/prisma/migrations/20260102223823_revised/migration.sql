-- AlterTable
ALTER TABLE "Step" ADD COLUMN     "completedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aiCredits" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "cachedInsights" JSONB,
ADD COLUMN     "defaultNotifyBefore" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "deleteAccountCode" TEXT,
ADD COLUMN     "deleteAccountCodeExpiry" TIMESTAMP(3),
ADD COLUMN     "lastAiReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastInsightsDate" TIMESTAMP(3),
ADD COLUMN     "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true;
