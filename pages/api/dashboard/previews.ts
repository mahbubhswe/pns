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

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!ensureAdmin(req, res)) {
    return;
  }

  ensureUploadDir();

  const parsed = await new Promise<{ fields: formidable.Fields; files: formidable.Files } | null>(
    (resolve, reject) => {
      const form = formidable({
        uploadDir: UPLOAD_DIR,
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
  const pdf = Array.isArray(fileEntry) ? fileEntry[0] : fileEntry;
  if (!pdf || !pdf.originalFilename) {
    return res.status(400).json({ error: "PDF file is required" });
  }

  console.log("Preview upload payload:", {
    fieldNames: Object.keys(files),
    fields,
  });

  const newName = `${Date.now()}-${pdf.newFilename || pdf.originalFilename}`;
  const destPath = path.join(UPLOAD_DIR, newName);
  try {
    fs.renameSync(pdf.filepath, destPath);
  } catch (moveErr) {
    console.warn("Rename failed, falling back to copy", moveErr);
    fs.copyFileSync(pdf.filepath, destPath);
    fs.unlinkSync(pdf.filepath);
  }

  const url = `/uploads/previews/${newName}`;
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
