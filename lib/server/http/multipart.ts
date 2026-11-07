import type { NextApiRequest } from "next";
import formidable, { type File as FormidableFile, type Fields, type Files } from "formidable";
import { ApiError } from "./errors";

export type { FormidableFile };

export type ParsedMultipart = {
  fields: Fields;
  files: Files;
};

export type MultipartOptions = {
  maxFileSize: number;
  multiples?: boolean;
};

/**
 * Parse a multipart/form-data request. Routes using this must export
 * `export const config = { api: { bodyParser: false } }`.
 */
export function parseMultipart(req: NextApiRequest, options: MultipartOptions): Promise<ParsedMultipart> {
  const form = formidable({
    multiples: options.multiples ?? false,
    maxFileSize: options.maxFileSize,
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

/** Normalise `File | File[] | undefined` to a single file (or null). */
export function pickFile(input: FormidableFile | FormidableFile[] | undefined): FormidableFile | null {
  if (!input) return null;
  if (Array.isArray(input)) return input.length ? input[0] : null;
  return input;
}

/** Like `pickFile` but throws a 400 when the field is missing. */
export function requireFile(files: Files, field: string): FormidableFile {
  const file = pickFile(files[field]);
  if (!file) throw ApiError.badRequest(`${field} file is required`);
  return file;
}

export function assertMimeType(file: FormidableFile, predicate: (mime: string) => boolean, message = "Invalid file type") {
  const mime = (file.mimetype || "").toLowerCase();
  if (!predicate(mime)) throw ApiError.badRequest(message);
}

export const isImageMime = (mime: string) => mime.startsWith("image/");
export const isPdfMime = (mime: string) => mime === "application/pdf";
export const isImageOrPdfMime = (mime: string) => isImageMime(mime) || isPdfMime(mime);
