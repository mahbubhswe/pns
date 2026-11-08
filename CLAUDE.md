# PNS — Purbachal Newtown Society

Membership website + admin management system for **Purbachal Newtown Society (PNS)**, a volunteer-run community of plot owners in Purbachal New Town (RAJUK township, NE of Dhaka). Plot owners register online with plot details, one ownership-proof document, NID, photo and payment proof (bKash or bank). On submit they get an application PDF by email. Staff review and approve members in `/dashboard`, keep the society's books (accounting module), manage staff accounts and roles, write posts, and upload the registration guideline PDF.

- Live: https://pnsbdv.vercel.app (Vercel)
- Repo: github.com/mahbubhswe/pns, branch `master`. Commits by mahbubhswe and Md. Saikat Islam, Sep–Dec 2025. Commit messages are single letters ("u"), so they tell you nothing.
- Repo README is the stock create-next-app text. This file is the real documentation.

## Working rules
- Keep edits minimal and targeted. Don't restructure, rename or restyle beyond what was asked.
- Never print or copy values from `.env` / `.env.local` (live DB, JWT and Blob secrets). Refer to them by key name only.
- Before deleting a dependency, check `jsonwebtoken` (see Known issues #15).
- Every new admin API must go through `requirePermissions`/`authorize` (lib/server/rbac.ts). Every new admin page passes `permission` to `<DashboardLayout>`.

## Stack
- **Next.js 16.0.10, Pages Router** (no `app/`), React 19, TypeScript strict with `allowJs`. Path alias `@/*` → repo root.
- **UI:** MUI v7 (theme in `theme/theme.ts`), `@mui/x-data-grid` v7 (all list pages), `@mui/x-charts` v7 (bar charts), `@mui/x-date-pickers` v8 with dayjs, Emotion, framer-motion (landing + hero), sweetalert2 (confirm dialogs), SWR + `lib/api.ts` `getJSON`/`postJSON`, `lib/format.ts` `sendJSON`, axios on legacy forms.
- **DB:** PostgreSQL on Neon (pooled endpoint, ap-southeast-1) via **Prisma 6**. The client is generated into `lib/generated/prisma`, which is gitignored and built by `postinstall: prisma generate`.
- **Auth:** bcryptjs + jsonwebtoken. JWTs live in httpOnly cookies and expire after 7 days. Staff permissions come from the `Role` table (see Roles).
- **Uploads:** formidable. When `BLOB_READ_WRITE_TOKEN` is set, files go to Vercel Blob via a raw REST `PUT https://blob.vercel-storage.com/<prefix>/<ts>-<field>-<name>?access=public` (no `@vercel/blob` SDK). Otherwise they go to local `public/uploads/`. On Vercel without the token, the route throws. Shared helper for new routes: `lib/server/upload.ts` `persistUpload(file, field)`.
- **Email/PDF:** nodemailer (Gmail SMTP) + `@react-pdf/renderer` (`lib/pdf-generator.tsx`).
- **XLSX import:** `lib/useXlsx.ts` loads SheetJS 0.18.5 from the jsDelivr CDN at runtime. It isn't an npm dependency.
- **Fonts:** Plus Jakarta Sans + Hind Siliguri (Bangla) via a Google Fonts `<link>` in `pages/_document.tsx` (no `next/font`, so builds don't need network).

## Commands
```bash
npm install                     # also runs prisma generate
npm run dev                     # next dev --webpack (webpack forced; Turbopack is the Next 16 default)
npm run build && npm start
npx prisma migrate dev          # schema change → new migration
npx prisma migrate deploy       # apply on prod DB (needed once for 20261108000000_roles_and_accounting)
npm run seed:admin              # upsert a Super Admin staff user. Env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME, ADMIN_PHONE, ADMIN_TITLE (defaults admin@pns.com / ChangeMe!)
node scripts/migrate-memberships.js <legacy.json>   # import a JSON array of legacy members (upsert by email; missing fields → "NA")
npx eslint .                    # `npm run lint` calls `next lint`, which Next 16 removed
```
There are no automated tests in the repo.

## Env keys
`DATABASE_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, `CORS_ALLOW_ORIGIN` (comma list; used only by the register route), `BLOB_UPLOAD_PREFIX` (default `pns-membership`), `BLOB_PREVIEW_PREFIX` (optional), `BLOB_ACCESS_LEVEL` (`public`|`private`), `BLOB_READ_WRITE_TOKEN`, `BLOB_URL` (optional). Optional SMTP keys: `SMTP_HOST`/`SMTP_PORT`/`SMTP_SECURE`/`SMTP_FROM`. `VERCEL` and `VERCEL_URL` are read automatically.

## Layout
```
middleware.ts                 cookie-presence redirects (see Auth)
pages/
  index.tsx                   public landing: animated hero (20 scenes), stats, About, Why join, How to join, Fees (copy buttons), FAQ, CTA
  auth/login, auth/register   thin wrappers → components/LoginForm, components/RegisterForm
  profile/index.tsx           member profile (client-only dynamic import of components/Profile)
  admin/login.tsx             staff login (AuthShell)
  dashboard/                  staff area, every page wrapped in <DashboardLayout title permission>
    index.tsx                 greeting band, member + finance stat cards, charts, latest applications
    membership/index.tsx      DataGrid of members, status tabs (?status=pending|active|inactive), date filter, CSV export, XLSX import
    membership/[id].tsx       member profile, approve/reject buttons, documents, "in the books" fee link, delete
    users/ index, add-user, [id]   staff CRUD, change role, activate/deactivate
    roles/index.tsx           role list + permission matrix editor
    accounting/
      index.tsx               overview: balances, month/year stats, 12-month chart, top heads, recent vouchers, fee sync
      vouchers/index.tsx      voucher list + filters + VoucherDialog (?new=INCOME|EXPENSE|TRANSFER&memberId&amount&party&ref)
      vouchers/[id].tsx       printable money receipt / payment / contra voucher, amount in words
      reports.tsx             8 standard reports, print + CSV (?type=…&accountId&headId)
      heads.tsx               ledger heads (income / expense)
      accounts.tsx            cash, bank & mobile-banking accounts with balances
    posts/ index, new, [id]   Post CRUD with RichText editor + cover image
    add-preview.tsx           upload the guideline PDF (PreviewDocument)
  api/                        see API table
components/
  landing/scene-kit.tsx       SVG primitives (sky, buildings, trees, cars, rickshaw, CNG, people, mosque, cranes…) + SCENE_CSS keyframes + <SceneDefs/> gradients
  landing/scenes.tsx          SCENES[20] {key,title,bn,caption,Render} and <SceneSvg index/>
  landing/HeroScenes.tsx      autoplay slider (7.5 s/scene), pause on hover/offscreen/hidden tab, segmented progress, keyboard arrows
  AuthShell.tsx               split-screen auth layout; also exports <SceneStage index/> (style + defs + scene) for any page
  PublicHeader.tsx, PublicFooter.tsx, BrandLogo.tsx (BrandMark SVG), ThemeToggle
  RegisterForm.tsx (~1.5k lines, own validation, no form library), LoginForm, Profile (with canvas crop for avatar)
  dashboard/Layout.tsx        responsive shell: grouped nav (filtered by permission), collapsible mini sidebar (lg+), drawer on mobile, account menu, NoAccess gate
  dashboard/ui.tsx            PageHeader, StatCard, SectionCard, EmptyState, StatusChip, TypeChip, TYPE_META, Grid
  dashboard/charts.tsx        IncomeExpenseChart, SingleBarChart, RankBars, useFinanceColors (validated palette)
  dashboard/UserForm.tsx      staff form (role select from /api/admin/roles, active switch, password optional on edit) + crop
  dashboard/RichText.tsx      contentEditable + execCommand
  accounting/data.ts          client types + useAccounts/useHeads
  accounting/VoucherDialog.tsx  create/edit voucher (type toggle, amount in words, attachment upload)
lib/
  prisma.ts                   singleton client from ./generated/prisma (logs every query)
  permissions.ts              PERMISSIONS catalogue, hasPermission, sanitizePermissions, legacyPermissions, DEFAULT_ROLES (shared client/server)
  useAdmin.ts                 SWR hook on /api/admin/me → { admin, can(perm) }
  format.ts                   money (৳ en-IN grouping), moneyCompact (K/L/Cr), amountInWords, formatDate, timeAgo, downloadCsv, sendJSON, apiError
  server/handler.ts           createApiHandler(methods): next-connect router, OPTIONS 204, 405, 500 {error, detail}
  server/auth.ts              getCookie(), ensureAdmin() (legacy; new code uses rbac.ts)
  server/rbac.ts              loadAdmin, authorize(req,res,perm), requirePermissions({GET:…, POST:…}), countActiveSuperAdmins
  server/staff.ts             safeUser (strips password, adds roleName/permissions)
  server/upload.ts            persistUpload (Blob or local)
  server/accounting.ts        voucher numbering, accountBalances, headTotals, voucherToJson, all report builders
  server/voucher-input.ts     validateVoucher
  pdf-generator.tsx, api.ts, useXlsx.ts
contexts/ThemeContext.tsx     light/dark mode, saved in localStorage "theme-mode"
theme/theme.ts                design tokens (see Design system)
prisma/schema.prisma          migrations: 20251226144305_init, 20261108000000_roles_and_accounting
scripts/                      seed-admin.js, migrate-memberships.js (CommonJS, import ../lib/generated/prisma)
public/brand-mark.svg         favicon / brand mark. public/uploads/ = local upload target
```

## Design system
- Palette: primary green `#0F6E56` (dark mode `#3FC79A`), secondary coral `#E2553C`, warning/highlight amber `#F4A62A`, ink `#12241D`, warm paper background `#F6F4EE`. Exported as `brand` from `theme/theme.ts`.
- `shape.borderRadius` is **4**, so sx `borderRadius: 3` = 12px. Cards 16px, buttons/inputs 10px (set in component overrides).
- Headings 800 weight, tight letter-spacing; amber "marker" highlight (`Highlight` in pages/index.tsx) for key words.
- Money is always `money()` / `moneyCompact()` from lib/format (Bangladeshi lakh/crore grouping).
- Chart colours: income `#1E8E6E` / expense `#E2553C` (light), `#2AA982` / `#E45F41` (dark) — validated for colour-blind separation; always keep the legend.
- `.no-print` hides elements when printing; the admin shell hides sidebar/top bar in print.

## Hero scenes
20 code-drawn, CSS-animated SVG scenes (no video files): Grand Boulevard, Lakeside Promenade, Welcome Home (gate + barrier), Villa Lane, Central Park, City Lights, 300 Feet Expressway, Golden Sunrise, Community Mosque, School Run, Monsoon Evening, Green & Solar, Neighbourhood Market, Playground, Building Our Future, Cycle Track, Care Close By, Festival Night, Master-Planned Township (aerial), Metro Connection.
- ViewBox 1600×900, `preserveAspectRatio="xMidYMid slice"`; keep focal content near the centre (phones crop the sides).
- Randomness uses the seeded `rng()` so SSR and client match. Never use `Math.random()` in a scene.
- Animated elements are wrapped: position with a `transform` attribute on an outer `<g>`, animate an inner `<g className="pns-…">` (CSS animations override the SVG transform attribute).
- Any page that renders `<SceneSvg>` needs `SCENE_CSS` + `<SceneDefs/>` once (HeroScenes and `SceneStage` include them).
- Animations pause when the hero is off-screen, the tab is hidden, or the user prefers reduced motion.

## Data model
- **User** is a *member / plot owner*, not a staff login. It holds the plot (`sectorNumber` 1–30 in the UI, `roadNumber`, `plotNumber`, `plotSize` in katha, min 3; `plotId` cuid unique), `ownershipProofType` (`LD_TAX_RECEIPT | MUTATION_PAPER | BDS_KHATIAN`) + `ownershipProofFile`, `ownerNameEnglish`/`ownerNameBangla`, `contactNumber`, `nidNumber` (13 or 17 digits), addresses, unique `email`, bcrypt `password`, `ownerPhoto`, `status` (`PENDING | APPROVED | REJECTED`, default PENDING), `paymentMethod` (`BKASH | BANK`) with `bkashTransactionId` (10 alphanumeric) / `bkashAccountNumber` (11 digits) / `bankAccountNumberFrom`, `paymentReceipt`, `membershipFee` (default 1020) and `agreeDataUse`. Relation: `vouchers`.
- **ManagementUser** is staff: `name`, `phone`, `email` unique, `password`, `title`, `photoUrl`, `address`, `roleId` → **Role** (SetNull), `isActive` (default true), `lastLoginAt`. Legacy enum `role` (`ADMIN | EDITOR | VIEWER`, default VIEWER) is kept in sync via `legacyRoleFor()` but access comes from `roleRef`. The timestamp field is `created`, not `createdAt`.
- **Role**: `name` unique, `description`, `permissions String[]` (keys from lib/permissions.ts, `"*"` = full access), `isSystem`. Seeded: Super Admin `["*"]`, Accountant, Editor, Viewer.
- **Post** has `title`, HTML `content`, `coverImage`, `published`, and `authorId` → **ManagementUser** (ON DELETE RESTRICT).
- **PreviewDocument** has `fileUrl`. The newest row is the guideline PDF shown by "Show Guideline" on the register form.
- **FundAccount** (accounting): `name` unique, `type` `CASH | BANK | MOBILE_BANKING`, `accountNumber`, `institution`, `branch`, `openingBalance Decimal(14,2)` (balance before the first voucher), `isActive`, `notes`. Seeded: Cash in Hand, Sonali Bank (DU Branch), bKash Wallet.
- **LedgerHead**: `name`, `code` unique (I-1xx income, E-2xx expense), `type` `INCOME | EXPENSE`, `isActive`, `isSystem` (Membership Fee). Unique (type, name). 19 heads seeded.
- **Voucher**: `voucherNo` unique (`RV-YYYY-00001` income, `PV-` expense, `CV-` transfer; sequence per type per calendar year), `type`, `status` `POSTED | VOID`, `date` (stored 00:00 UTC; API speaks `YYYY-MM-DD`), `amount Decimal(14,2)`, `headId` (income/expense), `accountId` (where money came in / went out / transfer source), `toAccountId` (transfer destination), `partyName`, `reference`, `description`, `attachmentUrl`, `memberId` → User (SetNull), `createdById`/`voidedById` → ManagementUser, `voidReason`, `voidedAt`. Vouchers are never deleted, only voided; voided vouchers are excluded from every balance and report. Type and year can't change on edit.
- **Status vocabulary:** the DB stores `APPROVED/PENDING/REJECTED`. The UI uses `active/pending/inactive`. `/api/memberships` (list) maps to the UI strings, and `PATCH /api/memberships/[id]` expects UI strings. `/api/memberships/[id]` GET and `/api/profile` return the **raw enum**. Check which shape a route returns before comparing.

## Auth & roles
Two independent cookie sessions share `JWT_SECRET`, which falls back to `"dev-secret"` when unset:
- **Members:** `pns_token` from `POST /api/auth/login`, payload `{sub: User.id, email}`. Member APIs verify it inline.
- **Staff:** `admin_token` from `POST /api/admin/login`, payload `{sub: ManagementUser.id, email, role}`. Login refuses deactivated accounts and stamps `lastLoginAt`.
- Admin APIs call `requirePermissions`/`authorize`, which verifies the JWT **and reloads the user + role from the DB on every request** — role changes and deactivation take effect immediately. 401 = no/invalid session, 403 = missing permission.
- Permissions (lib/permissions.ts): `dashboard.view`, `members.view|manage|delete`, `posts.view|manage`, `guideline.manage`, `accounting.view|entry|void|setup|reports`, `users.view|manage`, `roles.manage`. Accountant has no `accounting.void` on purpose (separation of duties).
- Safety rules: the Super Admin role always keeps `"*"`; built-in roles can't be renamed or deleted; a role with users can't be deleted; you can't deactivate/delete yourself; the last active full-access user can't be demoted, deactivated or deleted; staff with posts can only be deactivated.
- `middleware.ts` still only checks that a cookie *exists* (redirects: member on `/auth/*` → `/profile`; no `pns_token` on `/profile` → `/auth/login`; no `admin_token` on `/dashboard*` → `/admin/login`; API routes excluded). The dashboard shell redirects to `/admin/login` when `/api/admin/me` returns 401 and shows a "not part of your role" panel when the page's permission is missing.
- The login routes answer with a 303 redirect for form posts or HTML accepts, and with JSON otherwise.

## API routes
| Route | Methods | Permission | Notes |
|---|---|---|---|
| /api/auth/register (.tsx) | POST multipart | public + CORS | Validates the password (≥8). Saves 3 files. Creates the User (30 s timeout race), renders the PDF and emails it. Duplicate email → 409. |
| /api/auth/login, /logout | POST | – | pns_token |
| /api/profile | GET | pns_token | member's own record (raw enum status) |
| /api/profile/photo | POST multipart `photo` | pns_token | Blob/local |
| /api/admin/login, /logout | POST | – | admin_token |
| /api/admin/me | GET | any staff | `{admin: {id,name,email,title,photoUrl,roleId,roleName,permissions}}` |
| /api/admin/users, /users/[id] | GET / POST, PATCH, DELETE | users.view / users.manage | body uses `roleId`, `isActive`; password optional on PATCH |
| /api/admin/roles, /roles/[id] | GET / POST, PATCH, DELETE | GET: roles.manage or users.view; writes: roles.manage | unknown permission keys are dropped |
| /api/admin/posts, /posts/[id] | GET / POST PATCH DELETE | posts.view / posts.manage | author = signed-in staff. UI shape `{coverUrl, created}` ↔ DB `{coverImage, createdAt}` |
| /api/admin/upload | POST multipart `file` (`?kind=document` allows PDF) | any staff | Blob or local |
| /api/memberships | GET (`?start&end`) / POST (XLSX rows) | members.view / members.manage | |
| /api/memberships/[id] | GET / PATCH(status) / DELETE | members.view / members.manage / members.delete | |
| /api/memberships/stats | GET | members.view | nothing calls it |
| /api/dashboard/stats | GET | dashboard.view | counts by enum + `monthly[12]` + `recent[6]` |
| /api/dashboard/previews | POST multipart `file` (PDF, 20 MB) | guideline.manage | plain handler |
| /api/previews/latest | GET | public | `{url}` of the newest PreviewDocument |
| /api/accounting/summary | GET | accounting.view or .reports | balances, month/year totals, 12-month trend, top heads, recent vouchers, approved members without a fee voucher |
| /api/accounting/accounts, /accounts/[id] | GET / POST, PATCH, DELETE | read: any accounting; write: accounting.setup | DELETE only if unused |
| /api/accounting/heads, /heads/[id] | GET / POST, PATCH, DELETE | read: any accounting; write: accounting.setup | DELETE only if unused and not system |
| /api/accounting/vouchers | GET (`from,to,type,status,headId,accountId,memberId,q,limit`) / POST | accounting.view|entry / accounting.entry | returns `{vouchers, totals}` |
| /api/accounting/vouchers/[id] | GET / PATCH | accounting.view|entry / accounting.entry | |
| /api/accounting/vouchers/[id]/void | POST `{reason}` | accounting.void | |
| /api/accounting/reports | GET `type=income-expenditure|receipts-payments|cash-book|head-ledger|day-book|trial-balance|balance-sheet|monthly-summary` (+ `from,to,accountId,headId,year`) | accounting.reports | |
| /api/accounting/sync-member-fees | GET (preview) / POST `{bkashAccountId, bankAccountId, headId?}` | accounting.entry | one RV per approved member without a voucher, dated on their application day |

## Conventions for new code
- **API route:**
  ```ts
  const handler = createApiHandler(["GET", "POST"]);
  handler.use(requirePermissions({ GET: "members.view", POST: "members.manage" }));
  handler.get(async (req: AdminRequest, res) => { /* req.admin is the signed-in staff user */ });
  export default handler;
  ```
  Add new permission keys to `PERMISSIONS` in lib/permissions.ts (and to seeded roles if they should get it).
- **Multipart:** `export const config = { api: { bodyParser: false } }`, formidable, then `persistUpload()` from lib/server/upload.ts.
- **Data access:** `import { prisma } from "@/lib/prisma"`. Convert Decimal with `num()` from lib/server/accounting.
- **New admin page:** `<DashboardLayout title="…" permission="…">`, start with `<PageHeader eyebrow title subtitle actions crumbs/>`, add it to `navGroups` in `components/dashboard/Layout.tsx` with its permission. Lists use DataGrid (+ `columnVisibilityModel` to hide columns on phones), sweetalert2 for confirms, `can()` from `useAdmin()` to hide buttons.
- **Shared constants:** the fee, bKash "Send Money" number and Sonali Bank (Dhaka University branch) account/routing are hardcoded in **both** `pages/index.tsx` and `components/RegisterForm.tsx` (and seeded into FundAccount). Change all. Fees are BDT 1020 by bKash and BDT 1000 by bank.
- **Images:** hellopurbachal.com is still whitelisted in `next.config.ts` but no page uses it now — the hero and page banners are SVG scenes. The PNGs and icons in `public/` are unused.
- **Language:** UI copy is English with Bangla accents (Hind Siliguri).

## Known issues
**Security (open)**
1. `.env` and `.env.local` are **committed**, because `.gitignore` has no `.env*` entry. They contain the live Neon credentials, `JWT_SECRET` and the Blob token. The fix is to rotate them, untrack the files and add them to `.gitignore`.
2. The Gmail SMTP username and app password are hardcoded in `pages/api/auth/register.tsx` (the transporter `auth`). `SMTP_FROM` and `SMTP_USER` are unset, so `from` is undefined.
3. The middleware trusts cookie presence alone (APIs do verify) and the JWT secret has an insecure fallback. *(Role enforcement was added Nov 2026.)*
4. Real-looking uploads (photos, receipts, PDFs) are committed under `public/uploads/`.

**Bugs (open)**
10. In register, if the email or PDF step throws *after* the User is created, the route returns 500. A retry then gets a 409 "Email already exists".
11. `RegisterForm` problems: `canSubmit` requires `paymentReceipt` even for bKash; `membershipFee` is always sent as 1020, even for bank payments (1000); `LD_TAX_RECEIPT` isn't selectable.
13. The `isLocalhost` regex in the login/logout routes uses `\\d` inside a regex literal, so it never matches `localhost:3000`. Harmless because of the `NODE_ENV` check.
14. Posts have no public page yet (raw execCommand HTML, rendered with `dangerouslySetInnerHTML` in the admin preview).

**Fixed in Nov 2026:** #5 dashboard counts (enum compare), #6 member delete no longer deletes staff posts, #7 post author = signed-in staff, #8 `/api/admin/upload` supports Blob, #9 member detail/profile status use the raw enum, #12 staff edit without password, and roles are now enforced on every admin API.

**Housekeeping**
15. `jsonwebtoken` is imported by several files but isn't in `package.json`. It resolves only through `firebase-admin`. Add it explicitly before pruning dependencies.
16. Unused dependencies: firebase, firebase-admin, lottie-react, react-fast-marquee, i18n-iso-countries, @hugeicons/react, nookies, moment-timezone, @mui/lab, `cooki` (typo package), process. Both moment and dayjs are in use.
17. Next 16 mismatches: the `middleware.ts` convention is deprecated in favour of `proxy.ts`, `next lint` is gone, and `eslint-config-next` is still pinned to 15.3.0. `lib/prisma.ts` logs every query in production too.
