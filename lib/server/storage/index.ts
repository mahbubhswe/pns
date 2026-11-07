import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { env, isVercel } from "@/lib/config/env";
import { UPLOAD_FOLDERS } from "@/lib/config/constants";
import type { FormidableFile } from "@/lib/server/http/multipart";
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

/** Returns the public URL of the stored file. */
export async function persistUpload(file: FormidableFile, options: PersistOptions): Promise<string> {
  const tmpPath = file.filepath;
  if (!tmpPath) throw new Error("Upload has no temporary path");

  const folder = options.folder ?? "general";
  const fileName = buildFileName(file, options.label);
  const mimetype = file.mimetype || "application/octet-stream";

  if (env.BLOB_READ_WRITE_TOKEN) {
    return uploadToBlob(tmpPath, blobPrefix(folder), fileName, mimetype);
  }

  if (isVercel()) {
    throw new Error(
      "File uploads require BLOB_READ_WRITE_TOKEN when running on Vercel. Configure Vercel Blob and set the token."
    );
  }

  return moveToLocal(tmpPath, folder, fileName);
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

// ---------------------------------------------------------------------------

function buildFileName(file: FormidableFile, label: string): string {
  const original = file.originalFilename || "";
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

async function uploadToBlob(tmpPath: string, prefix: string, fileName: string, mimetype: string): Promise<string> {
  const base = env.BLOB_URL.replace(/\/$/, "");
  const uploadUrl = `${base}/${prefix}/${fileName}?access=${env.BLOB_ACCESS_LEVEL}`;
  const body = Uint8Array.from(fs.readFileSync(tmpPath));

  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${env.BLOB_READ_WRITE_TOKEN}`,
      "Content-Type": mimetype,
    },
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Blob upload failed (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as { url?: string };
  safeUnlink(tmpPath);
  if (!data?.url) throw new Error("Blob upload did not return a URL");
  return data.url;
}

function moveToLocal(tmpPath: string, folder: StorageFolder, fileName: string): string {
  const relDir = UPLOAD_FOLDERS[folder];
  const absDir = path.join(process.cwd(), "public", relDir);
  fs.mkdirSync(absDir, { recursive: true });
  const dest = path.join(absDir, fileName);

  try {
    fs.renameSync(tmpPath, dest);
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === "EXDEV") {
      fs.copyFileSync(tmpPath, dest);
      safeUnlink(tmpPath);
    } else {
      throw err;
    }
  }

  return `/${relDir}/${fileName}`;
}

function safeUnlink(p: string) {
  try {
    fs.unlinkSync(p);
  } catch {
    // ignore cleanup errors
  }
}
