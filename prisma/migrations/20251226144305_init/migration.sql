-- CreateEnum
CREATE TYPE "public"."OwnershipProofType" AS ENUM ('LD_TAX_RECEIPT', 'MUTATION_PAPER', 'BDS_KHATIAN');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('BKASH', 'BANK');

-- CreateEnum
CREATE TYPE "public"."ManagementRole" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "sectorNumber" TEXT NOT NULL,
    "roadNumber" TEXT NOT NULL,
    "plotNumber" TEXT NOT NULL,
    "plotSize" TEXT NOT NULL,
    "plotId" TEXT NOT NULL,
    "ownershipProofType" "public"."OwnershipProofType" NOT NULL,
    "ownershipProofFile" TEXT,
    "ownerNameEnglish" TEXT NOT NULL,
    "ownerNameBangla" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "nidNumber" TEXT NOT NULL,
    "presentAddress" TEXT NOT NULL,
    "permanentAddress" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ownerPhoto" TEXT,
    "password" TEXT NOT NULL,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "public"."PaymentMethod" NOT NULL,
    "bkashTransactionId" TEXT,
    "bkashAccountNumber" TEXT,
    "bankAccountNumberFrom" TEXT,
    "paymentReceipt" TEXT,
    "membershipFee" INTEGER NOT NULL DEFAULT 1020,
    "agreeDataUse" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Post" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "coverImage" TEXT,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ManagementUser" (
    "id" SERIAL NOT NULL,
    "photoUrl" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "role" "public"."ManagementRole" NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "title" TEXT,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManagementUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PreviewDocument" (
    "id" SERIAL NOT NULL,
    "title" TEXT,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreviewDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_plotId_key" ON "public"."User"("plotId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Post_authorId_createdAt_idx" ON "public"."Post"("authorId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ManagementUser_email_key" ON "public"."ManagementUser"("email");

-- CreateIndex
CREATE INDEX "ManagementUser_name_email_idx" ON "public"."ManagementUser"("name", "email");

-- AddForeignKey
ALTER TABLE "public"."Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."ManagementUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
