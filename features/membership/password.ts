// Member password reset ("forgot password") and staff-created set-up links
// (imported members start with a random password and need one of these).
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import type { User } from "@/lib/generated/prisma";
import { BCRYPT_ROUNDS, PASSWORD_RESET_TTL_SECONDS, PASSWORD_SETUP_TTL_SECONDS } from "@/lib/config/constants";
import { signPasswordResetToken, verifyPasswordResetToken } from "@/lib/server/auth/jwt";
import { ApiError } from "@/lib/server/http/errors";
import { sendMail } from "@/lib/server/mail/mailer";
import { logger } from "@/lib/server/logger";
import type { ResetPasswordInput } from "./schema";

/** Imported members without an email get a placeholder address that can't receive mail. */
export function isPlaceholderEmail(email: string): boolean {
  return /^imported\+.*@example\.com$/i.test(email);
}

function fingerprint(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("base64url").slice(0, 22);
}

function linkFor(user: User, origin: string, ttlSeconds: number): string {
  const token = signPasswordResetToken(user.id, fingerprint(user.password), ttlSeconds);
  return `${origin}/auth/reset?token=${encodeURIComponent(token)}`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function mailLink(user: User, url: string, siteName: string, setup: boolean): Promise<boolean> {
  const name = escapeHtml(user.ownerNameEnglish);
  const action = setup ? "Set your password" : "Reset your password";
  const intro = setup
    ? `An account has been created for you on the ${escapeHtml(siteName)} website. Set a password to sign in and see your membership details.`
    : `We received a request to reset the password for your ${escapeHtml(siteName)} member account.`;
  const expiry = setup ? "This link works for 7 days." : "This link works for 1 hour.";
  try {
    const { sent } = await sendMail({
      to: user.email,
      subject: `${action} — ${siteName}`,
      html: `<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#12241D;max-width:520px">
<p>Dear ${name},</p>
<p>${intro}</p>
<p style="margin:24px 0"><a href="${escapeHtml(url)}" style="background:#1F6B4F;color:#fff;padding:12px 22px;border-radius:8px;text-decoration:none;font-weight:bold">${action}</a></p>
<p style="color:#5B6B64;font-size:13px">${expiry} If you didn't ask for this, you can ignore this email.</p>
</div>`,
      text: `Dear ${user.ownerNameEnglish},\n\n${intro.replace(/&amp;/g, "&")}\n\n${action}: ${url}\n\n${expiry}`,
    });
    return sent;
  } catch (err) {
    logger.error("Password email failed", { userId: user.id, error: String(err) });
    return false;
  }
}

/**
 * Email a reset link when the address belongs to a member. Never reveals
 * whether it does: callers always answer "if the email exists, we sent a link".
 */
export async function requestPasswordReset(email: string, origin: string, siteName: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || isPlaceholderEmail(user.email)) return;
  await mailLink(user, linkFor(user, origin, PASSWORD_RESET_TTL_SECONDS), siteName, false);
}

async function userForToken(token: string): Promise<User> {
  const claims = verifyPasswordResetToken(token);
  const user = claims ? await prisma.user.findUnique({ where: { id: claims.sub } }) : null;
  if (!claims || !user || fingerprint(user.password) !== claims.fp) {
    throw ApiError.badRequest("This link is invalid or has expired. Please ask for a new one.");
  }
  return user;
}

/** What the reset page needs before showing the form. */
export async function inspectResetLink(token: string): Promise<{ name: string; needsEmail: boolean }> {
  const user = await userForToken(token);
  return { name: user.ownerNameEnglish, needsEmail: isPlaceholderEmail(user.email) };
}

/**
 * Set a new password from a reset / set-up link; the link stops working
 * afterwards. Imported members without an email also choose their login email here.
 */
export async function resetPassword(input: ResetPasswordInput): Promise<User> {
  const user = await userForToken(input.token);
  const data: { password: string; email?: string } = { password: await bcrypt.hash(input.password, BCRYPT_ROUNDS) };
  if (isPlaceholderEmail(user.email)) {
    if (!input.email) throw ApiError.badRequest("Enter your email address — you will use it to sign in.");
    const taken = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
    if (taken) throw ApiError.conflict("This email is already used by another member account.");
    data.email = input.email;
  }
  return prisma.user.update({ where: { id: user.id }, data });
}

/** Staff: a 7-day set-up link to share with a member (e.g. by WhatsApp), optionally emailed too. */
export async function createPasswordSetupLink(
  memberId: number,
  origin: string,
  siteName: string,
  sendEmail: boolean
): Promise<{ url: string; emailed: boolean; emailable: boolean }> {
  const user = await prisma.user.findUnique({ where: { id: memberId } });
  if (!user) throw ApiError.notFound("Member not found");
  const url = linkFor(user, origin, PASSWORD_SETUP_TTL_SECONDS);
  const emailable = !isPlaceholderEmail(user.email);
  const emailed = sendEmail && emailable ? await mailLink(user, url, siteName, true) : false;
  return { url, emailed, emailable };
}
