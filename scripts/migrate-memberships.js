#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const { PrismaClient } = require("../lib/generated/prisma");

function normalizeString(value, fallback) {
  if (value === undefined || value === null) return fallback;
  return String(value).trim();
}

function parseBool(value) {
  if (typeof value === "boolean") return value;
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

async function main() {
  const [,, fileArg] = process.argv;
  if (!fileArg) {
    throw new Error("Usage: node scripts/migrate-memberships.js <path-to-legacy-data.json>");
  }

  const dataPath = path.isAbsolute(fileArg) ? fileArg : path.join(process.cwd(), fileArg);
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Data file not found at ${dataPath}`);
  }

  const raw = fs.readFileSync(dataPath, "utf-8");
  const records = JSON.parse(raw);
  if (!Array.isArray(records)) {
    throw new Error("Legacy data file must be a JSON array of records.");
  }

  const statusMap = {
    approved: "APPROVED",
    active: "APPROVED",
    pending: "PENDING",
    rejected: "REJECTED",
    inactive: "REJECTED",
  };
  const allowedProofs = new Set(["LD_TAX_RECEIPT", "MUTATION_PAPER", "BDS_KHATIAN"]);
  const allowedPayments = new Set(["BKASH", "BANK"]);

  const prisma = new PrismaClient();
  try {
    let imported = 0;
    for (const record of records) {
      const email = normalizeString(record.email, `legacy+${randomUUID()}@example.com`).toLowerCase();
      const passwordSeed = normalizeString(record.password, randomUUID());
      const password = await bcrypt.hash(passwordSeed, 10);
      const cleanedStatus =
        statusMap[String(record.status || "").trim().toLowerCase()] || "PENDING";
      const proof = String(record.ownershipProofType || "LD_TAX_RECEIPT").trim().toUpperCase();
      const payment = String(record.paymentMethod || "BKASH").trim().toUpperCase();
      const createdAt = record.createdAt
        ? new Date(record.createdAt)
        : record.submittedAt
        ? new Date(record.submittedAt)
        : undefined;

      const data = {
        sectorNumber: normalizeString(record.sectorNumber, "NA"),
        roadNumber: normalizeString(record.roadNumber, "NA"),
        plotNumber: normalizeString(record.plotNumber, "NA"),
        plotSize: normalizeString(record.plotSize, "NA"),
        ownershipProofType: allowedProofs.has(proof) ? proof : "LD_TAX_RECEIPT",
        ownershipProofFile: normalizeString(record.ownershipProofFile, null),
        ownerNameEnglish: normalizeString(record.ownerNameEnglish, "Legacy Member"),
        ownerNameBangla: normalizeString(
          record.ownerNameBangla,
          normalizeString(record.ownerNameEnglish, "Legacy Member")
        ),
        contactNumber: normalizeString(record.contactNumber, "NA"),
        nidNumber: normalizeString(record.nidNumber, "NA"),
        presentAddress: normalizeString(record.presentAddress, "NA"),
        permanentAddress: normalizeString(record.permanentAddress, "NA"),
        email,
        ownerPhoto: normalizeString(record.ownerPhoto, null),
        paymentMethod: allowedPayments.has(payment) ? payment : "BKASH",
        bkashTransactionId: normalizeString(record.bkashTransactionId, null),
        bkashAccountNumber: normalizeString(record.bkashAccountNumber, null),
        bankAccountNumberFrom: normalizeString(record.bankAccountNumberFrom, null),
        paymentReceipt: normalizeString(record.paymentReceipt, null),
        membershipFee: Number(record.membershipFee) || 1020,
        agreeDataUse: parseBool(record.agreeDataUse),
        status: cleanedStatus,
        password,
        createdAt,
      };

      await prisma.user.upsert({
        where: { email },
        update: data,
        create: data,
      });
      imported += 1;
    }

    console.log(`Imported ${imported} legacy membership records.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
