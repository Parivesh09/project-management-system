/*
  Warnings:

  - Added the required column `ownerId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- First, get or create a default user to be the owner of existing projects
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "User" LIMIT 1) THEN
    INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
    VALUES (
      'default-owner',
      'admin@example.com',
      'default-password',
      'System Admin',
      'ADMIN',
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    );
  END IF;
END $$;

-- Add the new columns
ALTER TABLE "Project" 
ADD COLUMN "managerId" TEXT,
ADD COLUMN "ownerId" TEXT;

-- Set default owner for existing projects
UPDATE "Project"
SET "ownerId" = (SELECT id FROM "User" LIMIT 1)
WHERE "ownerId" IS NULL;

-- Now make ownerId not nullable
ALTER TABLE "Project" 
ALTER COLUMN "ownerId" SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE "Project" 
ADD CONSTRAINT "Project_ownerId_fkey" 
FOREIGN KEY ("ownerId") 
REFERENCES "User"("id") 
ON DELETE RESTRICT 
ON UPDATE CASCADE;

ALTER TABLE "Project" 
ADD CONSTRAINT "Project_managerId_fkey" 
FOREIGN KEY ("managerId") 
REFERENCES "User"("id") 
ON DELETE SET NULL 
ON UPDATE CASCADE;
