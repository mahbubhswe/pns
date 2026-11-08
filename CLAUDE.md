# CLAUDE.md

Guidance for AI assistants and new contributors working in this repository.

- Read `docs/ARCHITECTURE.md` first. It defines the layers
  (`app/api` → `features` → `lib/server` → `lib/config`) and the import
  direction. Do not add Prisma queries, bcrypt, JWT or filesystem code to a
  route file; put it in `features/<domain>/service.ts`.
- This is the Next.js App Router. API routes are `app/api/**/route.ts`
  wrapped with `route()`, validate input with Zod from the feature's
  `schema.ts`, authenticate members with `requireMember(req)` and staff with
  `await requirePermission(req, "<permission>")` from `features/access`, and
  return DTOs from `types/api.ts` via `json()`.
- Staff access is role-based. Permission keys live in
  `lib/shared/permissions.ts`; every staff route must call
  `requirePermission`. Dashboard pages wrap themselves in
  `<PageGate title permission>` (UX only — the API is the real check).
- Accounting vouchers are never deleted, only voided with a reason. Keep it
  that way; reports depend on it.
- Pages are server components that load data and pass it to `"use client"`
  components. Never import `lib/server` or `features` from a client file.
- New environment variables go in `lib/config/env.ts` **and** `.env.example`.
  Never hardcode credentials. Never commit `.env*` files.
- Business constants shared with the UI (fees, status labels) live in
  `lib/shared/`. Infrastructure constants (cookie names, limits) live in
  `lib/config/constants.ts`.
- Run `npm run check` (typecheck + lint) before finishing a change. `any` is a
  lint error in `lib/server`, `lib/config`, `features` and `types`.
- Database changes: edit `prisma/schema.prisma`, then
  `npm run db:migrate -- --name <change>`. Commit the migration.
- Dates cross the API as ISO strings; format with `dayjs` in the UI.
