# PNS – Purbachal Newtown Society

Membership portal and admin dashboard for Purbachal Newtown Society.
Members register with their plot and payment details; management users review
applications, publish posts and manage staff accounts.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the code layout and the
rules every new feature should follow.

## Requirements

- Node.js 20+
- PostgreSQL 14+

## Setup

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # then fill in DATABASE_URL, JWT_SECRET, SMTP_*
npm run db:migrate          # apply migrations to your local database
npm run dev                 # http://localhost:3000
```

Then open `http://localhost:3000/admin/login`. With an empty database it
redirects to the **first-run setup page**, where you create the initial admin
account and are signed in. After that the setup page is permanently closed.

Next, go to **Dashboard → Settings** to set the organisation name, membership
fees, bKash/bank details and whether registration is open. Everything the
public site shows comes from there.

Dashboard login: `/admin/login`. Member login: `/auth/login`.
`npm run db:seed` is an optional CLI alternative for creating an admin
(requires `ADMIN_EMAIL` and `ADMIN_PASSWORD`).

## Scripts

| Script                     | What it does                                        |
| -------------------------- | --------------------------------------------------- |
| `npm run dev`              | Development server                                  |
| `npm run build` / `start`  | Production build / serve                            |
| `npm run check`            | Typecheck + lint (run before every commit)          |
| `npm run typecheck`        | `tsc --noEmit`                                      |
| `npm run lint` / `lint:fix`| ESLint                                              |
| `npm run format`           | Prettier                                            |
| `npm run db:migrate`       | Create/apply a migration in development             |
| `npm run db:deploy`        | Apply migrations in production                      |
| `npm run db:studio`        | Prisma Studio                                       |
| `npm run db:seed`          | Seed the initial admin user                         |
| `npm run migrate:memberships <file.json>` | Import legacy membership records     |

## Environment

All variables are documented in [.env.example](.env.example) and validated at
runtime by `lib/config/env.ts`. The app refuses to start in production without
`DATABASE_URL` and a strong `JWT_SECRET`.

Email (application confirmation PDF) is sent only when `SMTP_USER` and
`SMTP_PASS` are set; otherwise registration still succeeds and a warning is
logged.

File uploads are stored under `public/uploads` locally, or in Vercel Blob when
`BLOB_READ_WRITE_TOKEN` is set.

## Project layout

```
app/              Routes (App Router): pages, layouts and app/api route handlers
features/         Business logic per domain (schema, service, mapper)
lib/server/       HTTP, auth, storage, mail, logger foundation
lib/config/       Validated env + constants
lib/shared/       Isomorphic business constants
types/api.ts      API contracts shared by server and browser
components/       React components
proxy.ts          Edge redirects (cookie presence only)
prisma/           Schema and migrations
scripts/          One-off Node scripts (seed, legacy import)
docs/             Architecture notes
```

## Deployment

1. Set the environment variables from `.env.example` on the host.
2. `npm run build`
3. `npm run db:deploy`
4. `npm start`

On Vercel the filesystem is read-only, so `BLOB_READ_WRITE_TOKEN` is required
for uploads.
