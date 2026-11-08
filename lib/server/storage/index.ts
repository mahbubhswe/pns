import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { env, isVercel } from "@/lib/config/env";
import { UPLOAD_FOLDERS } from "@/lib/config/constants";
import type { UploadFile } from "@/lib/server/http/multipart";
import { logger } from "@/lib/server/logger";

/**
 * File storage abstraction.
 *
 * Two drivers:
 *  - Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set (required on Vercel,
 *    whose filesystem is read-only);
 *  - local disk under `public/` otherwise (development / self-hosted).
 *
 * All upload endpoints go through `persistUpload`, so swapping to S3 or any
 * other provider later is a one-file change.
 */

export type StorageFolder = keyof typeof UPLOAD_FOLDERS;

export type PersistOptions = {
  /** Logical folder (maps to a local directory or blob prefix). */
  folder?: StorageFolder;
  /** Human-readable label embedded in the file name, e.g. "avatar". */
  label: string;
};

/** Store an uploaded file and return its public URL. */
export async function persistUpload(file: UploadFile, options: PersistOptions): Promise<string> {
  const folder = options.folder ?? "general";
  const fileName = buildFileName(file.name, options.label);
  const mimetype = file.type || "application/octet-stream";
  const bytes = Buffer.from(await file.arrayBuffer());

  if (env.BLOB_READ_WRITE_TOKEN) {
    return uploadToBlob(bytes, blobPrefix(folder), fileName, mimetype);
  }

  if (isVercel()) {
    throw new Error(
      "File uploads require BLOB_READ_WRITE_TOKEN when running on Vercel. Configure Vercel Blob and set the token."
    );
  }

  return writeLocal(bytes, folder, fileName);
}

/**
 * Delete a previously stored file when it lives on local disk. Blob deletions
 * are intentionally not attempted (requires a separate API); callers should
 * treat this as best-effort cleanup.
 */
export function deleteUploadIfLocal(publicUrl: string | null | undefined): void {
  if (!publicUrl || !publicUrl.startsWith("/uploads/")) return;
  const abs = path.join(process.cwd(), "public", publicUrl.replace(/^\/+/, ""));
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  if (!abs.startsWith(uploadsRoot)) return; // never escape the uploads dir
  try {
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch (err) {
    logger.warn("Failed to delete local upload", { publicUrl, err });
  }
}

export type StoredFile = { body: ReadableStream<Uint8Array> | Uint8Array; contentType: string; size: number | null };

/**
 * Read back a file previously returned by `persistUpload`, so it can be served
 * from our own origin. Needed for PDFs: Vercel Blob always sends them with
 * `Content-Disposition: attachment`, which makes browsers download instead of
 * preview. Returns null when the file does not exist.
 */
export async function readStoredFile(publicUrl: string): Promise<StoredFile | null> {
  if (/^https:\/\//i.test(publicUrl)) {
    const res = await fetch(publicUrl, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok || !res.body) throw new Error(`Failed to fetch stored file (${res.status})`);
    const length = Number(res.headers.get("content-length"));
    return {
      body: res.body,
      contentType: res.headers.get("content-type") || "application/octet-stream",
      size: Number.isFinite(length) && length > 0 ? length : null,
    };
  }

  if (!publicUrl.startsWith("/uploads/")) return null;
  const abs = path.join(process.cwd(), "public", publicUrl.replace(/^\/+/, ""));
  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  if (!abs.startsWith(uploadsRoot) || !fs.existsSync(abs)) return null; // never escape the uploads dir
  const bytes = new Uint8Array(fs.readFileSync(abs));
  const contentType = path.extname(abs).toLowerCase() === ".pdf" ? "application/pdf" : "application/octet-stream";
  return { body: bytes, contentType, size: bytes.byteLength };
}

// ---------------------------------------------------------------------------

function buildFileName(originalName: string, label: string): string {
  const original = originalName || "";
  const ext = sanitiseExt(path.extname(original));
  const base = path
    .basename(original, path.extname(original))
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  const safeLabel = label.replace(/[^a-zA-Z0-9_-]+/g, "_");
  const unique = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  return `${unique}-${safeLabel}${base ? `-${base}` : ""}${ext}`;
}

function sanitiseExt(ext: string): string {
  const clean = ext.toLowerCase().replace(/[^a-z0-9.]/g, "");
  return clean.startsWith(".") && clean.length <= 8 ? clean : "";
}

function blobPrefix(folder: StorageFolder): string {
  if (folder === "previews") return env.BLOB_PREVIEW_PREFIX || "pns-previews";
  return env.BLOB_UPLOAD_PREFIX;
}

async function uploadToBlob(bytes: Buffer, prefix: string, fileName: string, mimetype: string): Promise<string> {
  const base = env.BLOB_URL.replace(/\/$/, "");
  const uploadUrl = `${base}/${prefix}/${fileName}?access=${env.BLOB_ACCESS_LEVEL}`;

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${env.BLOB_READ_WRITE_TOKEN}`,
      "Content-Type": mimetype,
    },
    body: new Uint8Array(bytes),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Blob upload failed (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as { url?: string };
  if (!data?.url) throw new Error("Blob upload did not return a URL");
  return data.url;
}

function writeLocal(bytes: Buffer, folder: StorageFolder, fileName: string): string {
  const relDir = UPLOAD_FOLDERS[folder];
  const absDir = path.join(process.cwd(), "public", relDir);
  fs.mkdirSync(absDir, { recursive: true });
  fs.writeFileSync(path.join(absDir, fileName), bytes);
  return `/${relDir}/${fileName}`;
}
