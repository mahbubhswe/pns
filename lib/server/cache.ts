import { revalidatePath } from "next/cache";

/**
 * The home page is cached (ISR) so visitors get it instantly instead of
 * waiting for the database. Call this after any change that shows on it
 * (site settings, posts, committee) so the next visit sees the update.
 * Safe to call outside a request (scripts): it then does nothing.
 */
export function refreshPublicPages(): void {
  try {
    revalidatePath("/", "layout");
  } catch {
    // No Next.js request context (e.g. a CLI script).
  }
}
