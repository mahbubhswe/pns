import type { NextRequest } from "next/server";
import { ApiError } from "./errors";

/** A file received through `multipart/form-data` (web standard `File`). */
export type UploadFile = File;

export type ParsedMultipart = {
  /** First string value of each text field. */
  fields: Record<string, string>;
  /** All files per field name (a field may carry several). */
  files: Record<string, UploadFile[]>;
};

function isFile(value: FormDataEntryValue): value is File {
  return typeof value === "object" && value !== null && typeof (value as File).arrayBuffer === "function";
}

/** Parse a multipart request into text fields and files. */
export async function parseMultipart(req: NextRequest): Promise<ParsedMultipart> {
  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    throw ApiError.badRequest("Expected multipart/form-data");
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw ApiError.badRequest("Malformed multipart body");
  }

  const fields: Record<string, string> = {};
  const files: Record<string, UploadFile[]> = {};

  form.forEach((value, key) => {
    if (isFile(value)) {
      if (value.size === 0 && !value.name) return; // empty <input type=file>
      (files[key] ??= []).push(value);
    } else if (!(key in fields)) {
      fields[key] = value;
    }
  });

  return { fields, files };
}

/** First file for a field, or null. */
export function pickFile(files: ParsedMultipart["files"], field: string): UploadFile | null {
  return files[field]?.[0] ?? null;
}

/** Like `pickFile` but throws a 400 when the field is missing. */
export function requireFile(files: ParsedMultipart["files"], field: string): UploadFile {
  const file = pickFile(files, field);
  if (!file) throw ApiError.badRequest(`${field} file is required`);
  return file;
}

export function assertMimeType(file: UploadFile, predicate: (mime: string) => boolean, message = "Invalid file type") {
  const mime = (file.type || "").toLowerCase();
  if (!predicate(mime)) throw ApiError.badRequest(message);
}

export function assertFileSize(file: UploadFile, maxBytes: number) {
  if (file.size > maxBytes) {
    const mb = Math.round((maxBytes / (1024 * 1024)) * 10) / 10;
    throw ApiError.payloadTooLarge(`File is too large (max ${mb} MB)`);
  }
}

export const isImageMime = (mime: string) => mime.startsWith("image/");
export const isPdfMime = (mime: string) => mime === "application/pdf";
export const isImageOrPdfMime = (mime: string) => isImageMime(mime) || isPdfMime(mime);
