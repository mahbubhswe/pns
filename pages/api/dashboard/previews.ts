import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { ensureAdmin } from "@/lib/server/auth";

export const config = {
  api: {
    bodyParser: false,
  },
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "previews");
const BLOB_UPLOAD_PREFIX =
  process.env.BLOB_PREVIEW_PREFIX ||
  process.env.BLOB_UPLOAD_PREFIX ||
  "pns-previews";
const BLOB_ACCESS_LEVEL =
  process.env.BLOB_ACCESS_LEVEL === "private" ? "private" : "public";
const IS_VERCEL = Boolean(process.env.VERCEL);
const HAS_BLOB_TOKEN = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function pickFile(f: File | File[] | undefined): File | null {
  if (!f) return null;
  return Array.isArray(f) ? (f.length ? f[0] : null) : f;
}

async function persistPreviewFile(input: File | File[] | undefined): Promise<string | null> {
  const file = pickFile(input);
  if (!file || !file.originalFilename) return null;

  const originalName = file.originalFilename.toString();
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext).replace(/\s+/g, "_").slice(0, 40);
  const tmp = file.filepath;
  const mimetype = file.mimetype || "application/pdf";

  if (!tmp || typeof tmp !== "string") {
    return null;
  }

  if (HAS_BLOB_TOKEN) {
    const key = `${BLOB_UPLOAD_PREFIX}/${Date.now()}-preview-${base}${ext}`.replace(
      /\+/g,
      "/"
    );
    const baseBlobUrl = (
      process.env.BLOB_URL || "https://blob.vercel-storage.com"
    ).replace(/\/$/, "");
    const accessQuery = BLOB_ACCESS_LEVEL ? `?access=${BLOB_ACCESS_LEVEL}` : "";
    const uploadUrl = `${baseBlobUrl}/${key}${accessQuery}`;
    const fileBuffer = fs.readFileSync(tmp);
    const body = Uint8Array.from(fileBuffer);

    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        "Content-Type": mimetype || "application/octet-stream",
      },
      body: body,
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(
        `Failed to upload preview to blob storage (${response.status}): ${detail}`
      );
    }

    const data = (await response.json()) as { url?: string };
    try {
      fs.unlinkSync(tmp);
    } catch {
      // ignore cleanup errors
    }
    if (!data?.url) {
      throw new Error("Blob upload for preview did not return a URL.");
    }
    return data.url;
  }

  if (IS_VERCEL) {
    throw new Error(
      "Preview uploads require BLOB_READ_WRITE_TOKEN on Vercel. Configure Vercel Blob and set the token."
    );
  }

  ensureUploadDir();

  const safeName = `${Date.now()}-preview-${base}${ext}`;
  const destPath = path.join(UPLOAD_DIR, safeName);
  try {
    fs.renameSync(tmp, destPath);
  } catch (moveErr: any) {
    if (moveErr?.code === "EXDEV") {
      fs.copyFileSync(tmp, destPath);
      fs.unlinkSync(tmp);
    } else {
      throw moveErr;
    }
  }

  return `/uploads/previews/${safeName}`;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!ensureAdmin(req, res)) {
    return;
  }

  const parsed = await new Promise<{ fields: formidable.Fields; files: formidable.Files } | null>(
    (resolve, reject) => {
      const form = formidable({
        keepExtensions: true,
        multiples: false,
        maxFileSize: 20 * 1024 * 1024,
      });

      form.parse(req, (err, fields, files) => {
        if (err) {
          return reject(err);
        }
        resolve({ fields, files });
      });
    }
  ).catch(err => {
    console.error("Preview upload failed:", err);
    res.status(500).json({ error: "Failed to parse upload" });
    return null;
  });

  if (!parsed) {
    return;
  }

  const { fields, files } = parsed;

  const fileEntry = files.file as File | File[] | undefined;
  const pdf = pickFile(fileEntry);
  if (!pdf || !pdf.originalFilename) {
    return res.status(400).json({ error: "PDF file is required" });
  }

  console.log("Preview upload payload:", {
    fieldNames: Object.keys(files),
    fields,
  });

  let url: string | null = null;
  try {
    url = await persistPreviewFile(pdf);
  } catch (err) {
    console.error("Preview upload failed:", err);
    return res
      .status(500)
      .json({ error: (err as Error).message || "Failed to store preview" });
  }

  if (!url) {
    return res.status(400).json({ error: "PDF file is required" });
  }

  const preview = await prisma.previewDocument.create({
    data: {
      fileUrl: url,
    },
  });

  return res.status(201).json({
    ok: true,
    preview,
  });
};

export default handler;
