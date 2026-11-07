/**
 * Minimal structured logger. Swap the implementation here (e.g. for pino) and
 * every module benefits; never call `console.*` directly from feature code.
 */
type Level = "debug" | "info" | "warn" | "error";

const isProd = process.env.NODE_ENV === "production";

function write(level: Level, message: string, meta?: unknown) {
  if (level === "debug" && isProd) return;
  const line = {
    level,
    time: new Date().toISOString(),
    msg: message,
    ...(meta !== undefined ? { meta: serialise(meta) } : {}),
  };
  const out = level === "error" || level === "warn" ? console.error : console.log;
  out(isProd ? JSON.stringify(line) : `[${level}] ${message}`, isProd ? "" : (meta ?? ""));
}

function serialise(meta: unknown) {
  if (meta instanceof Error) {
    return { name: meta.name, message: meta.message, stack: meta.stack };
  }
  return meta;
}

export const logger = {
  debug: (msg: string, meta?: unknown) => write("debug", msg, meta),
  info: (msg: string, meta?: unknown) => write("info", msg, meta),
  warn: (msg: string, meta?: unknown) => write("warn", msg, meta),
  error: (msg: string, meta?: unknown) => write("error", msg, meta),
};
