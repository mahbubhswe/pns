// pages/api/profile/photo.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { createApiHandler } from "@/lib/server/handler";

export const config = {
  api: { bodyParser: false },
};

const BLOB_UPLOAD_PREFIX = process.env.BLOB_UPLOAD_PREFIX || "pns-membership";
const BLOB_ACCESS_LEVEL =
  process.env.BLOB_ACCESS_LEVEL === "private" ? "private" : "public";
const IS_VERCEL = Boolean(process.env.VERCEL);
const HAS_BLOB_TOKEN = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function ensureUploadsDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function pickFile(f: any): any | null {
  if (!f) return null;
  return Array.isArray(f) ? (f.length ? f[0] : null) : f;
}

async function persistAvatarFile(
  file: any,
  fieldName: string
): Promise<string | null> {
  const ext = path.extname(file?.originalFilename || "");
  const base = (file?.originalFilename || fieldName)
    .toString()
    .replace(/\s+/g, "_")
    .slice(0, 40);
  const tmp: string | undefined = (file as any)?.filepath || (file as any)?.path;
  const mimetype: string | undefined = (file as any)?.mimetype || (file as any)?.type;

  if (!tmp || typeof tmp !== "string") {
    return null;
  }

  if (HAS_BLOB_TOKEN) {
    const key = `${BLOB_UPLOAD_PREFIX}/${Date.now()}-${fieldName}-${base}${ext}`.replace(
      /\+/g,
      "/"
    );
    const baseBlobUrl = (process.env.BLOB_URL || "https://blob.vercel-storage.com").replace(
      /\/$/,
      ""
    );
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
      body,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(
        `Failed to upload ${fieldName} to blob storage (${response.status}): ${detail}`
      );
    }

    const data = (await response.json()) as { url?: string };
    try {
      fs.unlinkSync(tmp);
    } catch {
      // ignore cleanup errors
    }
    if (!data?.url) {
      throw new Error(`Blob upload for ${fieldName} did not return a URL.`);
    }
    return data.url;
  }

  if (IS_VERCEL) {
    throw new Error(
      "File uploads require BLOB_READ_WRITE_TOKEN when running on Vercel. Configure Vercel Blob and set the token."
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  ensureUploadsDir(uploadDir);
  const safeName = `${Date.now()}-${fieldName}-${base}${ext || ".jpg"}`;
  const dest = path.join(uploadDir, safeName);

  try {
    fs.renameSync(tmp, dest);
  } catch (err: any) {
    if (err?.code === "EXDEV") {
      fs.copyFileSync(tmp, dest);
      fs.unlinkSync(tmp);
    } else {
      throw err;
    }
  }

  return `/uploads/${safeName}`;
}

const handler = createApiHandler(["POST"]);

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const cookie = req.headers.cookie || "";
    const token = cookie
      .split(/;\s*/)
      .map(p => p.split("="))
      .find(([k]) => k === "pns_token")?.[1];
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const secret = process.env.JWT_SECRET || "dev-secret";
    let payload: any;
    try {
      payload = jwt.verify(decodeURIComponent(token), secret);
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
    const userId = Number(payload?.sub);
    if (!userId) return res.status(401).json({ error: "Invalid token" });

    const form = formidable({
      multiples: false,
      maxFileSize: 10 * 1024 * 1024,
      keepExtensions: true,
    });
    const { files }: any = await new Promise((resolve, reject) => {
      form.parse(req, (err, _fields, fls) => (err ? reject(err) : resolve({ files: fls })));
    });

    const f = pickFile(files?.photo);
    if (!f) return res.status(400).json({ error: "No photo uploaded" });

    const mime = (f.mimetype || f.type || "").toString();
    if (!mime.startsWith("image/")) {
      return res.status(400).json({ error: "Invalid file type" });
    }

    const publicUrl = await persistAvatarFile(f, "avatar");
    if (!publicUrl) {
      return res.status(500).json({ error: "Failed to store uploaded photo" });
    }

    const existing = await prisma.user.findUnique({
      where: { id: userId },
      select: { ownerPhoto: true },
    });
    if (existing?.ownerPhoto && existing.ownerPhoto.startsWith("/uploads/")) {
      const oldPath = path.join(
        process.cwd(),
        "public",
        existing.ownerPhoto.replace(/^\/+/, "")
      );
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch {
          // noop
        }
      }
    }

    await prisma.user.update({ where: { id: userId }, data: { ownerPhoto: publicUrl } });

    return res.status(200).json({ ok: true, url: publicUrl });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: "Server error", detail: e?.message ?? String(e) });
  }
});

export default handler;
