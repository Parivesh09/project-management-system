-- AlterTable
ALTER TABLE "User" ADD COLUMN     "smtpFrom" TEXT,
ADD COLUMN     "smtpHost" TEXT,
ADD COLUMN     "smtpPass" TEXT,
ADD COLUMN     "smtpPort" TEXT,
ADD COLUMN     "smtpSecure" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "smtpUser" TEXT,
ADD COLUMN     "useCustomEmail" BOOLEAN NOT NULL DEFAULT false;
