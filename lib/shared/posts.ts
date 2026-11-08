/**
 * Post audiences. Isomorphic: used by the API schema and the dashboard UI.
 *
 *  - PUBLIC:  everyone; shown on the landing page and /news.
 *  - MEMBERS: logged-in members only; on their profile and /news, never on the landing page.
 *  - STAFF:   dashboard only.
 * Drafts (published = false) are dashboard-only whatever the audience.
 */
export const POST_AUDIENCES = ["PUBLIC", "MEMBERS", "STAFF"] as const;
export type PostAudience = (typeof POST_AUDIENCES)[number];

export const POST_AUDIENCE_LABELS: Record<PostAudience, { label: string; hint: string }> = {
  PUBLIC: { label: "Public", hint: "Everyone. Shown on the landing page and the News page." },
  MEMBERS: { label: "Members only", hint: "Logged-in members only. Not on the landing page." },
  STAFF: { label: "Staff only", hint: "Dashboard users only. Never shown on the website." },
};
