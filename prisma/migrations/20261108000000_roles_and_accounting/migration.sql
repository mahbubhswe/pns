-- Roles & permissions + society accounting (Nov 2026)

-- CreateEnum
CREATE TYPE "public"."FundAccountType" AS ENUM ('CASH', 'BANK', 'MOBILE_BANKING');

-- CreateEnum
CREATE TYPE "public"."LedgerHeadType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "public"."VoucherType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER');

-- CreateEnum
CREATE TYPE "public"."VoucherStatus" AS ENUM ('POSTED', 'VOID');

-- AlterTable
ALTER TABLE "public"."ManagementUser" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastLoginAt" TIMESTAMP(3),
ADD COLUMN     "roleId" INTEGER,
ALTER COLUMN "role" SET DEFAULT 'VIEWER';

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FundAccount" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."FundAccountType" NOT NULL,
    "accountNumber" TEXT,
    "institution" TEXT,
    "branch" TEXT,
    "openingBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."LedgerHead" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "type" "public"."LedgerHeadType" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LedgerHead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Voucher" (
    "id" SERIAL NOT NULL,
    "voucherNo" TEXT NOT NULL,
    "type" "public"."VoucherType" NOT NULL,
    "status" "public"."VoucherStatus" NOT NULL DEFAULT 'POSTED',
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "headId" INTEGER,
    "accountId" INTEGER NOT NULL,
    "toAccountId" INTEGER,
    "partyName" TEXT,
    "reference" TEXT,
    "description" TEXT,
    "attachmentUrl" TEXT,
    "memberId" INTEGER,
    "createdById" INTEGER,
    "voidReason" TEXT,
    "voidedAt" TIMESTAMP(3),
    "voidedById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ManagementUser_roleId_idx" ON "public"."ManagementUser"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "public"."Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FundAccount_name_key" ON "public"."FundAccount"("name");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerHead_code_key" ON "public"."LedgerHead"("code");

-- CreateIndex
CREATE UNIQUE INDEX "LedgerHead_type_name_key" ON "public"."LedgerHead"("type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_voucherNo_key" ON "public"."Voucher"("voucherNo");

-- CreateIndex
CREATE INDEX "Voucher_date_idx" ON "public"."Voucher"("date");

-- CreateIndex
CREATE INDEX "Voucher_type_date_idx" ON "public"."Voucher"("type", "date");

-- CreateIndex
CREATE INDEX "Voucher_headId_idx" ON "public"."Voucher"("headId");

-- CreateIndex
CREATE INDEX "Voucher_accountId_idx" ON "public"."Voucher"("accountId");

-- CreateIndex
CREATE INDEX "Voucher_toAccountId_idx" ON "public"."Voucher"("toAccountId");

-- CreateIndex
CREATE INDEX "Voucher_memberId_idx" ON "public"."Voucher"("memberId");

-- AddForeignKey
ALTER TABLE "public"."ManagementUser" ADD CONSTRAINT "ManagementUser_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Voucher" ADD CONSTRAINT "Voucher_headId_fkey" FOREIGN KEY ("headId") REFERENCES "public"."LedgerHead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Voucher" ADD CONSTRAINT "Voucher_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "public"."FundAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Voucher" ADD CONSTRAINT "Voucher_toAccountId_fkey" FOREIGN KEY ("toAccountId") REFERENCES "public"."FundAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Voucher" ADD CONSTRAINT "Voucher_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Voucher" ADD CONSTRAINT "Voucher_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."ManagementUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Voucher" ADD CONSTRAINT "Voucher_voidedById_fkey" FOREIGN KEY ("voidedById") REFERENCES "public"."ManagementUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Seed data (system roles, starter ledger heads and fund accounts)
-- ---------------------------------------------------------------------------

INSERT INTO "public"."Role" ("name", "description", "permissions", "isSystem", "updatedAt") VALUES
  ('Super Admin', 'Full access to every part of the portal.', ARRAY['*'], true, CURRENT_TIMESTAMP),
  ('Accountant', 'Keeps the books: vouchers, fund accounts and reports.', ARRAY['dashboard.view','members.view','accounting.view','accounting.entry','accounting.setup','accounting.reports'], true, CURRENT_TIMESTAMP),
  ('Editor', 'Reviews members and publishes content.', ARRAY['dashboard.view','members.view','posts.view','accounting.view','members.manage','posts.manage','guideline.manage'], true, CURRENT_TIMESTAMP),
  ('Viewer', 'Read-only access to members, posts and accounts.', ARRAY['dashboard.view','members.view','posts.view','accounting.view'], true, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Existing staff keep the access they had: ADMIN -> Super Admin, EDITOR -> Editor, VIEWER -> Viewer
UPDATE "public"."ManagementUser" mu SET "roleId" = r."id"
FROM "public"."Role" r
WHERE mu."roleId" IS NULL AND (
  (mu."role" = 'ADMIN' AND r."name" = 'Super Admin') OR
  (mu."role" = 'EDITOR' AND r."name" = 'Editor') OR
  (mu."role" = 'VIEWER' AND r."name" = 'Viewer')
);

INSERT INTO "public"."LedgerHead" ("code", "name", "type", "description", "isSystem", "updatedAt") VALUES
  ('I-101', 'Membership Fee', 'INCOME', 'One-time registration fee from new members.', true, CURRENT_TIMESTAMP),
  ('I-102', 'Monthly Subscription', 'INCOME', 'Regular member contributions.', false, CURRENT_TIMESTAMP),
  ('I-103', 'Donation', 'INCOME', 'Voluntary donations from members and well-wishers.', false, CURRENT_TIMESTAMP),
  ('I-104', 'Development Fund', 'INCOME', 'Contributions earmarked for community development.', false, CURRENT_TIMESTAMP),
  ('I-105', 'Event Sponsorship', 'INCOME', 'Sponsorship for meetings, festivals and events.', false, CURRENT_TIMESTAMP),
  ('I-106', 'Bank Interest', 'INCOME', 'Interest credited by the bank.', false, CURRENT_TIMESTAMP),
  ('I-199', 'Other Income', 'INCOME', NULL, false, CURRENT_TIMESTAMP),
  ('E-201', 'Office Rent', 'EXPENSE', NULL, false, CURRENT_TIMESTAMP),
  ('E-202', 'Salary & Honorarium', 'EXPENSE', NULL, false, CURRENT_TIMESTAMP),
  ('E-203', 'Utilities', 'EXPENSE', 'Electricity, water, gas, internet.', false, CURRENT_TIMESTAMP),
  ('E-204', 'Printing & Stationery', 'EXPENSE', NULL, false, CURRENT_TIMESTAMP),
  ('E-205', 'Meetings & Events', 'EXPENSE', NULL, false, CURRENT_TIMESTAMP),
  ('E-206', 'Transport & Conveyance', 'EXPENSE', NULL, false, CURRENT_TIMESTAMP),
  ('E-207', 'Website & IT', 'EXPENSE', 'Hosting, domain, software.', false, CURRENT_TIMESTAMP),
  ('E-208', 'Bank & bKash Charges', 'EXPENSE', NULL, false, CURRENT_TIMESTAMP),
  ('E-209', 'Security Services', 'EXPENSE', NULL, false, CURRENT_TIMESTAMP),
  ('E-210', 'Legal & Registration', 'EXPENSE', NULL, false, CURRENT_TIMESTAMP),
  ('E-211', 'Development Works', 'EXPENSE', 'Roads, drains, lighting, landscaping.', false, CURRENT_TIMESTAMP),
  ('E-299', 'Miscellaneous', 'EXPENSE', NULL, false, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

INSERT INTO "public"."FundAccount" ("name", "type", "accountNumber", "institution", "branch", "updatedAt") VALUES
  ('Cash in Hand', 'CASH', NULL, NULL, NULL, CURRENT_TIMESTAMP),
  ('Sonali Bank (DU Branch)', 'BANK', '4405702001730', 'Sonali Bank Limited', 'Dhaka University', CURRENT_TIMESTAMP),
  ('bKash Wallet', 'MOBILE_BANKING', '01625358082', 'bKash', NULL, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
