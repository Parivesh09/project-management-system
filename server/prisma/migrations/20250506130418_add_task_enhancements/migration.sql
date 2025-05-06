/*
  Warnings:

  - The `details` column on the `AuditLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `userId` on the `Task` table. All the data in the column will be lost.
  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `frequency` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `entityId` to the `AuditLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityType` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_userId_fkey";

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "entityId" TEXT NOT NULL,
ADD COLUMN     "entityType" TEXT NOT NULL,
DROP COLUMN "details",
ADD COLUMN     "details" JSONB;

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "userId",
ADD COLUMN     "lastRun" TIMESTAMP(3),
ADD COLUMN     "nextRun" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
DROP COLUMN "priority",
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
ALTER COLUMN "dueDate" DROP NOT NULL,
ALTER COLUMN "projectId" DROP NOT NULL,
DROP COLUMN "frequency",
ADD COLUMN     "frequency" "Frequency";

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
