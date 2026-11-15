-- Membership type (General / Associate), application reference and PNS ID.
CREATE TYPE "MemberType" AS ENUM ('GENERAL', 'ASSOCIATE');

ALTER TABLE "User"
  ADD COLUMN "membershipType" "MemberType" NOT NULL DEFAULT 'GENERAL',
  ADD COLUMN "relationToOwner" TEXT,
  ADD COLUMN "ownerPnsId" TEXT,
  ADD COLUMN "applicationRef" TEXT,
  ADD COLUMN "pnsId" TEXT;

CREATE UNIQUE INDEX "User_applicationRef_key" ON "User"("applicationRef");
CREATE UNIQUE INDEX "User_pnsId_key" ON "User"("pnsId");

-- Give existing applications a reference number too.
UPDATE "User"
SET "applicationRef" = 'APP-' || to_char("createdAt", 'YYYY') || '-' || lpad("id"::text, 5, '0')
WHERE "applicationRef" IS NULL;

-- Executive committee.
CREATE TABLE "CommitteeMember" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "bio" TEXT,
    "photoUrl" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CommitteeMember_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CommitteeMember_isActive_sortOrder_idx" ON "CommitteeMember"("isActive", "sortOrder");

-- Society documents.
CREATE TABLE "SiteDocument" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "audience" "PostAudience" NOT NULL DEFAULT 'PUBLIC',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "uploadedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteDocument_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SiteDocument_audience_sortOrder_idx" ON "SiteDocument"("audience", "sortOrder");
