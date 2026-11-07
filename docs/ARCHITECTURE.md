# Architecture

PNS (Purbachal Newtown Society) is a Next.js application with two audiences:

- **Members** (plot owners) who register, log in and view their profile.
- **Management users** (ADMIN / EDITOR / VIEWER) who run the dashboard: review
  memberships, manage posts, manage other management users, upload the
  guideline PDF.

Stack: Next.js 16 (Pages Router), React 19, MUI 7, Prisma 6 + PostgreSQL,
JWT cookies, Zod, nodemailer, `@react-pdf/renderer`.

## Layers

Requests flow top to bottom. A layer may import from the layers below it,
never from the layers above.

```
pages/api/**            HTTP controllers   (thin: parse → call service → map → respond)
features/<domain>/**    Business logic     (schema.ts, service.ts, mapper.ts, index.ts)
lib/server/**           Server foundation  (http, auth, storage, mail, logger)
lib/config/**           Env + constants    (validated process.env, cookie names, limits)
lib/prisma.ts           Database client
lib/generated/prisma    Generated Prisma client (git-ignored, built by `prisma generate`)
```

Cross-cutting, importable from anywhere:

```
types/api.ts            API contracts (DTOs) shared by server and browser
lib/shared/**           Isomorphic business constants (fees, status mappings)
```

Browser side:

```
pages/**                Routes (UI only; no business rules)
components/**           React components
contexts/, theme/       MUI theme + colour-mode provider
lib/api.ts              Typed fetch client (apiGet / apiPost / apiPostForm …)
```

### `pages/api` – controllers

A route file should read like a table of contents:

```ts
const handler = createApiHandler<AdminRequest>(["GET", "PATCH"]);
handler.use(requireAdmin);

handler.get(async (req, res) => {
  const id = parseIdParam(req.query.id);
  const post = await getPostById(id);
  res.status(200).json({ post: toPostDto(post) } satisfies PostResponse);
});
```

Rules:

- Always build the handler with `createApiHandler`. It gives you 405/OPTIONS
  handling and maps thrown errors (`ApiError`, `ZodError`, Prisma errors) to
  consistent JSON: `{ ok: false, error, code, details? }`.
- Validate input with a Zod schema from the feature module (`parseBody`,
  `parseQuery`, `parseIdParam`). Never read `req.body.foo` untyped.
- Authenticate with `requireAdmin` / `requireMember` (or `requireRole("ADMIN")`).
  They attach `req.admin` / `req.member` with the verified JWT claims.
- Multipart routes export `config = { api: { bodyParser: false } }` and use
  `parseMultipart` + `requireFile` + `assertMimeType`.
- Return DTOs from `types/api.ts`; never return raw Prisma rows.
- No `prisma.*` calls and no `bcrypt`, `jwt`, `fs` in a route file.

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
| `http/handler.ts`      | `createApiHandler`, `toErrorResponse`, `sendError`             |
| `http/errors.ts`       | `ApiError` with static helpers (`notFound()`, `conflict()` …)  |
| `http/validate.ts`     | `parseBody`, `parseQuery`, `parseIdParam`, `parseBoolean`      |
| `http/multipart.ts`    | `parseMultipart`, `pickFile`, `requireFile`, mime predicates   |
| `http/cors.ts`         | `cors()` middleware for public endpoints                       |
| `http/negotiation.ts`  | `wantsHtml` / `redirectSeeOther` for no-JS form posts          |
| `auth/jwt.ts`          | `signMemberToken`, `signAdminToken`, `verifyToken`             |
| `auth/cookies.ts`      | `getCookie`, `setAuthCookie`, `clearAuthCookie`                |
| `auth/guards.ts`       | `requireAdmin`, `requireMember`, `requireRole`, typed requests |
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
- `middleware.ts` only checks cookie *presence* to redirect pages. Real
  verification happens in API guards.
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
4. **Route**: `pages/api/...` using `createApiHandler` + guards + schema +
   service + mapper.
5. **UI**: call it through `lib/api.ts`; type responses with the DTO.
6. Run `npm run check` (typecheck + lint) before committing.

## Conventions

- `@/` path alias points at the repository root.
- Server-only modules (`lib/server`, `lib/config/env`, `features`) must never be
  imported from components or pages (other than `pages/api`). `lib/shared` and
  `types` are safe everywhere.
- No `any` in `lib/server`, `lib/config`, `features`, `types` (lint error).
  Elsewhere it is a warning to be reduced over time.
- Dates cross the API as ISO strings; the UI formats them with `dayjs`.
- Prefer `logger` over `console`.
