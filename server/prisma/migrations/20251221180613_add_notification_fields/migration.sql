-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "notifyBefore" INTEGER NOT NULL DEFAULT 15;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;
