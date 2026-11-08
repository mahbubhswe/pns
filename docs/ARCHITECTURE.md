# Architecture

PNS (Purbachal Newtown Society) is a Next.js application with two audiences:

- **Members** (plot owners) who register, log in and view their profile.
- **Management users** (staff) who run the dashboard: review memberships,
  manage posts, keep the society's books (income, expenditure, reports),
  manage staff accounts and roles, upload the guideline PDF and edit settings.
  What each person can do is decided by their **role** (see Roles).

Stack: Next.js 16 (App Router), React 19, MUI 7 (+ `@mui/x-data-grid`,
`@mui/x-charts`), Prisma 6 + PostgreSQL, JWT cookies, Zod, nodemailer,
`@react-pdf/renderer`.

## Layers

Requests flow top to bottom. A layer may import from the layers below it,
never from the layers above.

```
app/api/**/route.ts     HTTP controllers   (thin: parse → call service → map → respond)
features/<domain>/**    Business logic     (schema.ts, service.ts, mapper.ts, index.ts)
lib/server/**           Server foundation  (http, auth, storage, mail, logger)
lib/config/**           Env + constants    (validated process.env, cookie names, limits)
lib/prisma.ts           Database client
lib/generated/prisma    Generated Prisma client (git-ignored, built by `prisma generate`)
```

Cross-cutting, importable from anywhere:

```
types/api.ts            API contracts (DTOs) shared by server and browser
lib/shared/**           Isomorphic business constants (fees, status mappings, settings defaults,
                        the permission catalogue in lib/shared/permissions.ts)
```

Browser side:

```
app/**/page.tsx         Routes. Server components by default: load data, guard, render
app/**/layout.tsx       Shared shells (root: MUI cache + theme; dashboard: auth guard + nav)
components/**           React components ("use client" where they use hooks/MUI interactivity)
  landing/              The 20 animated SVG hero scenes (scene-kit.tsx pieces, scenes.tsx, HeroScenes slider)
  dashboard/            Admin shell (Layout), PageGate, shared UI blocks (ui.tsx), charts
  accounting/           Voucher dialog + SWR hooks for the accounting screens
contexts/, theme/       MUI theme + colour-mode provider
lib/api.ts              Typed fetch client (apiGet / apiPost / apiPostForm …)
lib/format.ts           Display helpers (money in ৳ with lakh grouping, dates, amount in words, CSV)
lib/useAdmin.ts         Signed-in staff member + `can(permission)` for the UI
proxy.ts                Edge redirects based on cookie presence (UX only)
```

### `app/api` – Route Handlers

A route file should read like a table of contents:

```ts
export const GET = route<{ id: string }>(async (req, { params }) => {
  requireAdmin(req);
  const post = await getPostById(parseIdParam(params.id));
  return json({ post: toPostDto(post) } satisfies PostResponse);
});
```

Rules:

- Always wrap handlers with `route()`. It resolves `params`, maps thrown
  errors (`ApiError`, `ZodError`, Prisma errors) to consistent JSON
  `{ ok: false, error, code, details? }`, and can add CORS (`{ cors: [...] }`
  plus `export const OPTIONS = preflight([...])`).
- Read the body with `readBody(req)` (JSON or form) or `parseMultipart(req)`
  (files), then validate with the feature's Zod schema via `parseBody`,
  `parseQuery(schema, req.nextUrl.searchParams)`, `parseIdParam`.
- Authenticate members with `requireMember(req)`. Authorise staff with
  `await requirePermission(req, "members.manage")` (or an array = any of them;
  no argument = any signed-in, active staff member) from `features/access`.
  It verifies the JWT, loads the user and role from the database and throws
  401/403, returning the staff member (`id`, `name`, `permissions` …).
- Uploads: `requireFile` + `assertMimeType` + `assertFileSize`, then
  `persistUpload(file, { label })`.
- Respond with `json(body)` or `json(body, 201)`; set cookies on the response
  with `setAuthCookie` / `clearAuthCookie`.
- Return DTOs from `types/api.ts`; never return raw Prisma rows.
- No `prisma.*` calls and no `bcrypt`, `jwt`, `fs` in a route file.
- Methods you do not export return 405 automatically.

### `app/**` – pages and layouts

- `page.tsx` files are server components. They call feature services directly
  (`await getPublicSettings()`), guard with `redirect()`, and pass plain data
  to a client component. Mark a page `"use client"` only when it is entirely
  interactive (the dashboard pages are).
- `app/layout.tsx` wraps everything with MUI's `AppRouterCacheProvider` and
  the theme provider, and derives `<title>` from site settings.
- `app/dashboard/layout.tsx` verifies the admin JWT from cookies server-side
  and redirects to `/admin/login` otherwise. It renders the shell
  (`components/dashboard/Layout.tsx`), whose sidebar shows only the sections
  the user's role allows. Each dashboard page wraps itself in
  `<PageGate title="…" permission="…">`, which sets the tab title and shows a
  friendly "not part of your role" screen. This is UX only; the API enforces
  the same permissions.
- Server components must not pass functions (e.g. `component={Link}`) into
  MUI props; do that inside a client component.

### `features/<domain>` – business logic

One folder per domain concept: `membership`, `post`, `management-user`,
`access` (roles + `requirePermission`), `accounting`, `preview`, `settings`,
`dashboard`. Each has:

| File         | Responsibility                                                 |
| ------------ | -------------------------------------------------------------- |
| `schema.ts`  | Zod schemas + inferred input types for every operation         |
| `service.ts` | Functions that implement use-cases against Prisma; throw `ApiError` |
| `mapper.ts`  | Prisma model → DTO (`types/api.ts`). Strips secrets.           |
| `index.ts`   | Barrel export                                                  |

Services are plain async functions, not classes, so they are easy to test and
compose. A service may call another feature's service (e.g. `dashboard` uses
`membership.getMembershipStats`).

### `lib/server` – foundation

| Module                 | Provides                                                       |
| ---------------------- | -------------------------------------------------------------- |
| `http/handler.ts`      | `route()`, `json()`, `readBody()`, `preflight()`, `toErrorResponse` |
| `http/errors.ts`       | `ApiError` with static helpers (`notFound()`, `conflict()` …)  |
| `http/validate.ts`     | `parseBody`, `parseQuery`, `parseIdParam`, `parseBoolean`      |
| `http/multipart.ts`    | `parseMultipart`, `requireFile`, `assertMimeType`, `assertFileSize` |
| `http/cors.ts`         | `applyCors`, `corsPreflight` for public endpoints              |
| `http/negotiation.ts`  | `wantsHtml` / `redirectSeeOther` for no-JS form posts          |
| `auth/jwt.ts`          | `signMemberToken`, `signAdminToken`, `verifyToken`             |
| `auth/cookies.ts`      | `getCookie`, `setAuthCookie`, `clearAuthCookie`                |
| `auth/guards.ts`       | `requireAdmin`, `requireMember`, `requireRole`, `getAdminFromCookies` |
| `storage/index.ts`     | `persistUpload` (local disk or Vercel Blob), `deleteUploadIfLocal` |
| `mail/mailer.ts`       | `sendMail` (no-op with a warning when SMTP is not configured)  |
| `logger.ts`            | `logger.info/warn/error` (JSON lines in production)            |

### Configuration

`lib/config/env.ts` validates `process.env` with Zod on first use. In
production a missing `JWT_SECRET` or `DATABASE_URL` throws immediately; there
are **no silent fallbacks**. Add every new variable there and in
`.env.example`.

`lib/config/constants.ts` holds infrastructure knobs (cookie names, token TTL,
upload limits). `lib/shared/membership.ts` holds business constants that the
UI also needs (fees, bank details, status mappings).

## Everything is database-driven

There are no hardcoded accounts and no hardcoded business settings at runtime.

- **First-run setup.** While the `ManagementUser` table is empty,
  `/admin/login` redirects to `/admin/setup`, which creates the first Super Admin
  through `POST /api/admin/setup` and signs them in. The moment any management
  user exists, both the page and the endpoint refuse (page redirects to login,
  endpoint returns 403). The check runs inside a transaction, so two
  simultaneous setups cannot both succeed.
- **Site settings** (`features/settings`). Organisation name, membership fees,
  bKash/bank details and the registration open/closed flag live in the
  `SiteSetting` table (one JSON row per section) and are edited at
  `/dashboard/settings`. `getSettings()` layers DB rows over the defaults in
  `lib/shared/settings.ts`, so a fresh database works before anything is saved.
  The home page and registration page load them in `getServerSideProps`; the
  registration API derives the stored fee from settings + payment method and
  ignores any fee sent by the browser.
- **Landing page content** is the `home` section of the same settings: hero
  headline and slides, about section, how-to-join steps, FAQ and the final
  call to action, edited under Settings → Landing page. Text may contain
  placeholders such as `{fee}` or `{bkash}` (see `HOME_PLACEHOLDERS`), which
  `renderTemplate()` fills from the live settings so copy never drifts from
  the payment details. Slide images can be any URL or an upload through the
  dashboard upload endpoint.
- **Roles.** Staff permissions come from the `Role` table, edited at
  `/dashboard/roles`. The catalogue of permission keys lives in
  `lib/shared/permissions.ts` (`members.view`, `accounting.entry`,
  `settings.manage` …; `"*"` = everything). Built-in roles: Super Admin (`*`),
  Accountant, Editor, Viewer; custom roles can be added. The Accountant role
  can record vouchers but not void them, so a second person signs off on
  corrections. Guards: nobody can deactivate or delete themselves, the Super
  Admin role always keeps full access, and the last active full-access user
  can't be demoted, deactivated or deleted. Permissions are read from the
  database on every request, so role changes and deactivation take effect
  immediately. `ManagementUser.role` (ADMIN/EDITOR/VIEWER) is kept in sync for
  backwards compatibility only.

## Accounting

`features/accounting` keeps simple single-entry books suitable for a
volunteer society:

- **Fund accounts** (`FundAccount`): cash in hand, bank accounts and mobile
  banking (bKash), each with an opening balance.
- **Ledger heads** (`LedgerHead`): categories of income (membership fee,
  donation …) and expenditure (office rent, utilities …), with optional codes.
- **Vouchers** (`Voucher`): receipts (`RV-2026-00001`), payments (`PV-…`) and
  transfers between accounts (`CV-…`), numbered per type per year. Vouchers
  are never deleted; a mistake is voided with a reason and drops out of every
  balance and report (the day book still lists it). Dates are stored at
  00:00 UTC; future dates and moving a voucher to another year are refused.
- **Membership fees**: `POST /api/accounting/sync-member-fees` creates one
  receipt per approved member that doesn't have one yet (bKash or bank account
  by payment method), dated on the application day.
- **Reports** (`features/accounting/reports.ts`, `GET /api/accounting/reports
  ?type=…`): income & expenditure, receipts & payments, cash/bank book, head
  ledger, day book, trial balance, balance sheet and monthly summary. The UI
  prints them and exports CSV.

## Auth model

- Two independent sessions: member cookie `pns_token` and admin cookie
  `admin_token`. Both are httpOnly JWTs signed with `JWT_SECRET`, carrying a
  `kind` claim so a member token can never be used as an admin token.
- `proxy.ts` only checks cookie *presence* to redirect pages. Real
  verification happens in API guards and in `app/dashboard/layout.tsx`.
- Passwords are bcrypt-hashed (`BCRYPT_ROUNDS`).

## File storage

All uploads go through `persistUpload`. Locally files land in
`public/uploads/**` (git-ignored). When `BLOB_READ_WRITE_TOKEN` is set they go
to Vercel Blob. Filenames are `timestamp-random-label-original.ext`, with the
original name sanitised; the original is never trusted for a path.

## Error contract

Every error response is:

```json
{ "ok": false, "error": "Human readable", "code": "NOT_FOUND", "details": { } }
```

`details` carries Zod issues for `VALIDATION_ERROR` and, in development only,
the underlying message for `INTERNAL_ERROR`. The browser client
(`lib/api.ts`) turns this into an `ApiClientError` with `status` and `code`.

## Adding a feature (checklist)

0. **Permission**: if staff need a new capability, add a key to
   `lib/shared/permissions.ts` and guard the route with `requirePermission`.
1. **Schema**: if it needs new data, edit `prisma/schema.prisma`, run
   `npm run db:migrate -- --name <change>`.
2. **Contract**: add/extend DTOs in `types/api.ts`.
3. **Feature module**: `features/<domain>/schema.ts` (Zod), `service.ts`,
   `mapper.ts`.
4. **Route**: `app/api/.../route.ts` using `route()` + guards + schema +
   service + mapper.
5. **UI**: a server `page.tsx` for data loading, a client component for
   interaction; call APIs through `lib/api.ts`; type responses with the DTO.
6. Run `npm run check` (typecheck + lint) before committing.

## Conventions

- `@/` path alias points at the repository root.
- Server-only modules (`lib/server`, `lib/config/env`, `features`) may be
  imported from server components, layouts and route handlers, never from a
  `"use client"` file. `lib/shared` and `types` are safe everywhere.
- No `any` in `lib/server`, `lib/config`, `features`, `types` (lint error).
  Elsewhere it is a warning to be reduced over time.
- Dates cross the API as ISO strings; the UI formats them with `dayjs` or
  `lib/format.ts`. Money is shown with `money()` (৳ with lakh/crore grouping).
- Design system: `theme/theme.ts` (green #0F6E56, coral #E2553C, amber
  #F4A62A; Plus Jakarta Sans + Hind Siliguri loaded in `app/layout.tsx`;
  4px corner radius). Chart colours come from `useFinanceColors()`.
- Prefer `logger` over `console`.
