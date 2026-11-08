import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { createApiHandler } from "@/lib/server/handler";
import { authorize } from "@/lib/server/rbac";
import { persistUpload } from "@/lib/server/upload";

export const config = { api: { bodyParser: false } };

const handler = createApiHandler(["POST"]);

handler.post(async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (!(await authorize(req, res))) return;

    const form = formidable({ multiples: false, maxFileSize: 10 * 1024 * 1024, keepExtensions: true });
    const { files }: any = await new Promise((resolve, reject) => {
      form.parse(req, (err, _fields, fls) => (err ? reject(err) : resolve({ files: fls })));
    });
    const f = Array.isArray(files?.file) ? files.file[0] : files?.file;
    if (!f) return res.status(400).json({ error: "No file uploaded" });
    const mime = (f.mimetype || "").toString();
    const kind = String(req.query.kind || "image");
    const allowed = kind === "document" ? mime.startsWith("image/") || mime === "application/pdf" : mime.startsWith("image/");
    if (!allowed) return res.status(400).json({ error: "Invalid file type" });

    const url = await persistUpload(f, kind === "document" ? "attachment" : "image");
    return res.status(200).json({ ok: true, url });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: "Upload failed", detail: e?.message || "" });
  }
});

export default handler;
