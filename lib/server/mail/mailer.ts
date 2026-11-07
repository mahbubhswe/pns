import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/lib/config/env";
import { logger } from "@/lib/server/logger";

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: MailAttachment[];
};

let transporter: Transporter | null | undefined;

/** True when SMTP credentials are configured. */
export function isMailConfigured(): boolean {
  return Boolean(env.SMTP_USER && env.SMTP_PASS);
}

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  if (!isMailConfigured()) {
    transporter = null;
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
}

/**
 * Send an email. When SMTP is not configured this logs a warning and resolves
 * `{ sent: false }` so that business flows (e.g. registration) still succeed.
 */
export async function sendMail(message: MailMessage): Promise<{ sent: boolean }> {
  const transport = getTransporter();
  if (!transport) {
    logger.warn("Mailer disabled: SMTP_USER / SMTP_PASS not set", { to: message.to, subject: message.subject });
    return { sent: false };
  }

  await transport.sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to: message.to,
    subject: message.subject,
    html: message.html,
    text: message.text,
    attachments: message.attachments,
  });
  return { sent: true };
}
