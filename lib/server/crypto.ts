// Encrypt secrets stored in the database (e.g. payment gateway passwords).
// AES-256-GCM with a key derived from JWT_SECRET: if JWT_SECRET is rotated,
// stored secrets can no longer be read and must be entered again.
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { env } from "@/lib/config/env";

const key = () => createHash("sha256").update(`pns-secret-box:${env.JWT_SECRET}`).digest();

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), data.toString("base64url")].join(".");
}

/** Returns null when the value can't be decrypted (tampered, or JWT_SECRET changed). */
export function decryptSecret(box: string): string | null {
  try {
    const [v, iv, tag, data] = box.split(".");
    if (v !== "v1" || !iv || !tag || !data) return null;
    const decipher = createDecipheriv("aes-256-gcm", key(), Buffer.from(iv, "base64url"));
    decipher.setAuthTag(Buffer.from(tag, "base64url"));
    return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
