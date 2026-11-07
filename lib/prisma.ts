import { PrismaClient } from "./generated/prisma";

/**
 * Single Prisma client per process.
 *
 * In development Next.js hot-reloads modules, which would otherwise create a
 * new client (and a new connection pool) on every change; caching it on
 * `globalThis` avoids that. Query logging is development-only.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? ["error", "warn"]
        : ["query", "error", "warn"],
  });
}

export const prisma: PrismaClient = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export type { PrismaClient };
