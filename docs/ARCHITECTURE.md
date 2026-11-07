# Architecture

PNS (Purbachal Newtown Society) is a Next.js application with two audiences:

- **Members** (plot owners) who register, log in and view their profile.
- **Management users** (ADMIN / EDITOR / VIEWER) who run the dashboard: review
  memberships, manage posts, manage other management users, upload the
  guideline PDF.

Stack: Next.js 16 (App Router), React 19, MUI 7, Prisma 6 + PostgreSQL,
JWT cookies, Zod, nodemailer, `@react-pdf/renderer`.

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
lib/shared/**           Isomorphic business constants (fees, status mappings, settings defaults)
```

Browser side:

```
app/**/page.tsx         Routes. Server components by default: load data, guard, render
app/**/layout.tsx       Shared shells (root: MUI cache + theme; dashboard: auth guard + nav)
components/**           React components ("use client" where they use hooks/MUI interactivity)
contexts/, theme/       MUI theme + colour-mode provider
lib/api.ts              Typed fetch client (apiGet / apiPost / apiPostForm …)
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
- Authenticate with `requireAdmin(req)` / `requireMember(req)` /
  `requireRole(req, "ADMIN")`. They return the verified JWT claims or throw.
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
  and redirects to `/admin/login` otherwise.
- Server components must not pass functions (e.g. `component={Link}`) into
  MUI props; do that inside a client component.

### `features/<domain>` – business logic

One folder per domain concept: `membership`, `post`, `management-user`,
`preview`, `dashboard`. Each has:

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
  `/admin/login` redirects to `/admin/setup`, which creates the first ADMIN
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
- **Roles.** `ADMIN` can do everything. Creating, editing or deleting staff
  accounts, deleting members and changing settings are `requireRole("ADMIN")`.
  EDITOR and VIEWER can log in and use the rest. The last ADMIN cannot be
  deleted, and nobody can delete themselves. Role is embedded in the JWT, so a
  role change takes effect at the user's next login.

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
- Dates cross the API as ISO strings; the UI formats them with `dayjs`.
- Prefer `logger` over `console`.
