#!/usr/bin/env node
/*
  Optional: create or update an ADMIN management user from the command line.

  The normal way to create the first admin is the first-run setup page: start
  the app with an empty database and open /admin/login — it redirects to
  /admin/setup. Use this script only for automation (CI, recovery).

  Required env vars (no defaults, to avoid shipping a guessable account):
  - ADMIN_EMAIL
  - ADMIN_PASSWORD   (at least 8 characters)
  Optional:
  - ADMIN_NAME, ADMIN_PHONE, ADMIN_TITLE
*/

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("../lib/generated/prisma");

async function main() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  const name = process.env.ADMIN_NAME || "Administrator";
  const phone = process.env.ADMIN_PHONE || "0000000000";
  const title = process.env.ADMIN_TITLE || "Admin";

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required (no defaults are provided).");
  }
  if (password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters.");
  }

  const prisma = new PrismaClient();
  try {
    const hash = await bcrypt.hash(password, 10);

    const user = await prisma.managementUser.upsert({
      where: { email },
      update: { name, phone, title, password: hash, role: "ADMIN" },
      create: { name, phone, title, email, password: hash, role: "ADMIN" },
    });

    console.log("Seeded admin user:", { id: user.id, email: user.email, name: user.name });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
