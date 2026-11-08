// lib/server/upload.ts — store an uploaded file in Vercel Blob (when configured) or public/uploads.
import fs from "fs";
import path from "path";
import type { File } from "formidable";

const BLOB_UPLOAD_PREFIX = process.env.BLOB_UPLOAD_PREFIX || "pns-membership";
const BLOB_ACCESS_LEVEL = process.env.BLOB_ACCESS_LEVEL === "private" ? "private" : "public";

export async function persistUpload(file: File, fieldName: string): Promise<string> {
  const originalName = (file.originalFilename || "file").toString();
  const ext = path.extname(originalName) || ".bin";
  const base = path.basename(originalName, ext).replace(/[^\w.-]+/g, "_").slice(0, 40) || "file";
  const tmp = file.filepath;
  if (!tmp) throw new Error("Invalid upload");

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const key = `${BLOB_UPLOAD_PREFIX}/${Date.now()}-${fieldName}-${base}${ext}`;
    const baseUrl = (process.env.BLOB_URL || "https://blob.vercel-storage.com").replace(/\/$/, "");
    const response = await fetch(`${baseUrl}/${key}?access=${BLOB_ACCESS_LEVEL}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        "Content-Type": file.mimetype || "application/octet-stream",
      },
      body: Uint8Array.from(fs.readFileSync(tmp)),
    });
    if (!response.ok) throw new Error(`Blob upload failed (${response.status}): ${await response.text()}`);
    const data = (await response.json()) as { url?: string };
    try {
      fs.unlinkSync(tmp);
    } catch {}
    if (!data.url) throw new Error("Blob upload returned no URL");
    return data.url;
  }

  if (process.env.VERCEL) {
    throw new Error("File uploads require BLOB_READ_WRITE_TOKEN when running on Vercel.");
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filename = `${Date.now()}-${fieldName}-${base}${ext}`;
  const dest = path.join(dir, filename);
  try {
    fs.renameSync(tmp, dest);
  } catch (err: any) {
    if (err?.code !== "EXDEV") throw err;
    fs.copyFileSync(tmp, dest);
    fs.unlinkSync(tmp);
  }
  return `/uploads/${filename}`;
}
