// Payment gateway credentials, entered by an admin and stored in the database.
// Kept out of the public site settings; the password is encrypted at rest and
// never sent back to the browser.
import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret } from "@/lib/server/crypto";
import { ApiError } from "@/lib/server/http/errors";
import type { GatewaySettingsDto } from "@/types/api";
import type { UpdateGatewayInput } from "./schema";

const KEY = "payment_gateway";

type Stored = { enabled: boolean; sandbox: boolean; storeId: string; storePasswordBox: string | null };
export type GatewayConfig = { enabled: boolean; sandbox: boolean; storeId: string; storePassword: string | null; baseUrl: string };

async function readStored(): Promise<Stored> {
  const row = await prisma.siteSetting.findUnique({ where: { key: KEY } });
  const v = (row?.value ?? {}) as Partial<Stored>;
  return {
    enabled: v.enabled === true,
    sandbox: v.sandbox !== false,
    storeId: typeof v.storeId === "string" ? v.storeId : "",
    storePasswordBox: typeof v.storePasswordBox === "string" ? v.storePasswordBox : null,
  };
}

export async function getGatewayConfig(): Promise<GatewayConfig> {
  const s = await readStored();
  return {
    enabled: s.enabled,
    sandbox: s.sandbox,
    storeId: s.storeId,
    storePassword: s.storePasswordBox ? decryptSecret(s.storePasswordBox) : null,
    baseUrl: s.sandbox ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com",
  };
}

/** Ready to take payments: switched on and fully configured. */
export async function getActiveGateway(): Promise<GatewayConfig | null> {
  const c = await getGatewayConfig();
  return c.enabled && c.storeId && c.storePassword ? c : null;
}

export async function getGatewaySettings(): Promise<GatewaySettingsDto> {
  const s = await readStored();
  const readable = s.storePasswordBox ? decryptSecret(s.storePasswordBox) !== null : false;
  return { enabled: s.enabled, sandbox: s.sandbox, storeId: s.storeId, hasPassword: readable, passwordUnreadable: Boolean(s.storePasswordBox) && !readable };
}

export async function updateGatewaySettings(input: UpdateGatewayInput, updatedById: number): Promise<GatewaySettingsDto> {
  const current = await readStored();
  const storePasswordBox = input.storePassword ? encryptSecret(input.storePassword) : current.storePasswordBox;
  if (input.enabled && (!input.storeId || !storePasswordBox)) {
    throw ApiError.badRequest("Enter the Store ID and Store password before switching online payment on.");
  }
  const value: Stored = { enabled: input.enabled, sandbox: input.sandbox, storeId: input.storeId, storePasswordBox };
  await prisma.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, value, updatedById },
    update: { value, updatedById },
  });
  return getGatewaySettings();
}
