import { prisma } from "@/lib/prisma";
import type { User } from "@/lib/generated/prisma";
import { ApiError } from "@/lib/server/http/errors";
import { logger } from "@/lib/server/logger";
import { ALL_ACCESS } from "@/lib/shared/permissions";
import { loadAdminContext, type AdminContext } from "@/features/access";
import type { ImpersonatorDto } from "@/types/api";

/**
 * "Log in as": lets a staff user see the portal exactly as a member or another
 * staff user does, for support. Rules:
 *  - members.impersonate / users.impersonate permissions (Super Admin has both);
 *  - never yourself, never a deactivated account, never while already logged in as someone;
 *  - never a staff user with any access you don't have yourself (no privilege escalation);
 *  - sessions are short (IMPERSONATION_TTL_SECONDS) and every start/stop is logged.
 */

/** True when every permission the target holds is also held by the actor. */
function coversPermissions(actor: string[], target: string[]): boolean {
  if (actor.includes(ALL_ACCESS)) return true;
  if (target.includes(ALL_ACCESS)) return false;
  return target.every(p => actor.includes(p));
}

/** Validate a staff → staff impersonation and return the target. */
export async function startStaffImpersonation(actor: AdminContext, targetId: number): Promise<AdminContext> {
  if (targetId === actor.id) throw ApiError.badRequest("You are already signed in as yourself.");
  const target = await loadAdminContext(targetId);
  if (!target) throw ApiError.notFound("This staff user doesn't exist or is deactivated.");
  if (!coversPermissions(actor.permissions, target.permissions)) {
    throw ApiError.forbidden("You can't log in as someone who has access you don't have.");
  }
  logger.info("impersonation.start", { kind: "staff", actorId: actor.id, actorEmail: actor.email, targetId: target.id });
  return target;
}

/** Validate a staff → member impersonation and return the member. */
export async function startMemberImpersonation(actor: AdminContext, memberId: number): Promise<User> {
  const member = await prisma.user.findUnique({ where: { id: memberId } });
  if (!member) throw ApiError.notFound("Member not found");
  logger.info("impersonation.start", { kind: "member", actorId: actor.id, actorEmail: actor.email, targetId: member.id });
  return member;
}

export function logImpersonationStop(kind: "staff" | "member", actorId: number | undefined, targetId: number): void {
  logger.info("impersonation.stop", { kind, actorId, targetId });
}

/** Name of the staff user behind a "log in as" session, for the banner. */
export async function describeImpersonator(id: number | undefined): Promise<ImpersonatorDto | null> {
  if (!id) return null;
  const user = await prisma.managementUser.findUnique({ where: { id }, select: { id: true, name: true } });
  return user ? { id: user.id, name: user.name } : null;
}
