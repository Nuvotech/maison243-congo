# Architecture Context

## Stack

| Layer          | Technology                                   | Role |
| -------------- | -------------------------------------------- | ---- |
| Framework      | Laravel 11 (PHP 8.3)                          | Routing, controllers, Eloquent models, policies, queues, scheduler — one app for all three portals |
| UI             | Blade + Livewire 3 + Alpine.js + Tailwind CSS 3 (Vite) | Server-rendered pages; Livewire for tables, filters, drawers, dialogs and forms |
| Auth           | Laravel Breeze (session auth) + Policies/Gates | Login, password reset, email verification, invite acceptance; authorization per model |
| Database       | MySQL 8.0.16+ (InnoDB, utf8mb4) via Eloquent | Single system of record for all three sides |
| File storage   | AWS S3 `af-south-1` via Laravel `Storage` (`s3` public bucket behind CloudFront, `s3-private` bucket) | Processed listing photos, logos, avatars (public); ID documents, title deeds, screening reports (private) |
| Queue / cache  | Redis + Laravel Horizon                      | Emails, image processing (`media` queue), gateway webhooks, scheduled jobs |
| Image processing | PHP Imagick (WebP + HEIC/libheif)          | Auto-rotate, strip EXIF/GPS, lighting correction, resize, compress before S3 |
| Payments       | PayFast or Paystack (behind `PaymentGateway` interface) | Card payments for sellers, debit orders for agencies, refunds |
| Screening      | Provider behind `ScreeningProvider` interface (stub in v1) | Applicant consent, credit/ID/affordability report |
| Mail           | Laravel Mail (Postmark/SES)                  | Invites, review decisions, lead alerts, payment reminders |
| Charts         | Server-computed series rendered as inline SVG in Blade | Overview activity chart, listing mix gauge, performance bars |
| Testing        | Pest + Laravel test helpers                  | Feature tests per route group, policy tests for tenant isolation |

## System Boundaries

- `app/Domain/Listings` — listing lifecycle (`ListingStatus` state machine, `TransitionListing` action), photos, status history, expiry rules.
- `app/Domain/Accounts` — users, organisations, memberships, verifications, invites.
- `app/Domain/Billing` — agency plans, listing products, platform settings, subscriptions, invoices, invoice lines, payments, credit ledger, VAT maths, `PaymentGateway` adapters.
- `app/Domain/Leads` — lead capture, assignment, status.
- `app/Domain/Screenings` — screening requests, invite tokens, reports, `ScreeningProvider` adapters.
- `app/Domain/Media` — image uploads: `StoreUploadedImage` action, `ImagePipeline` (compress, resize, lighting), `ProcessUploadedImage` job, `Media` model.
- `app/Domain/Audit` — `AuditLogger` service; the only writer to `audit_log`.
- `app/Http/Admin` + `routes/admin.php` — admin portal controllers/Livewire components (`admin.maison243.co.za`, `platform_staff` guard check).
- `app/Http/Seller` + `routes/seller.php` — private seller portal (`/seller`).
- `app/Http/Agency` + `routes/agency.php` — agency portal (`/agency`), role-aware for Principal / Admin / Agent.
- `app/Http/Webhooks` — payment gateway and screening provider callbacks (signature-verified, idempotent).
- `app/Console` + `routes/console.php` — scheduled jobs: expire listings, expire mandates, end featured placement, reset monthly credits, mark invoices overdue, issue subscription invoices.
- `resources/views/components` — shared Blade UI components (button, tag, card, table, drawer, dialog, segmented control, toast, stat card).

Portals never call each other; they share only the `app/Domain` layer.

## Storage Model

- **MySQL database**: every record and relationship — users, agencies, memberships, verifications, listings and their status history, leads, screenings (status, result, summary JSON), plans/products/settings, subscriptions, invoices/lines/payments, credit ledger, daily listing stats, audit log. Money is integer cents; times are UTC.
- **Object storage — public disk**: processed listing photos (WebP variants large/medium/thumb + JPEG share image), agency logos, agent avatars. DB stores paths in `media.variants`.
- **Object storage — private disk**: ID documents, title deeds, CIPC/FFC certificates (compressed + resized, lighting untouched), screening reports (PDF). Served only through short-lived signed URLs after a policy check.
- **Image pipeline** (`app/Domain/Media`): every image upload → local temp → `ProcessUploadedImage` job on the `media` queue → auto-rotate, strip EXIF/GPS, lighting correction, resize, compress → S3 → raw file deleted. Raw originals are never stored in S3. Profiles and tuning in `config/images.php`.
- **Redis**: queues, cache (dashboard counts, plan lookups), sessions in production, rate limits.
- **Payment gateway**: card numbers and bank details. The DB keeps only tokens (`payment_methods.gateway_token`) and references (`payments.gateway_ref`).

## Auth and Access Model

- Everyone signs in through the same Breeze session auth; the `users` table holds staff, private sellers and agency members.
- **Admin side**: allowed only if a row exists in `platform_staff` with `is_active = 1`. Staff role (`Super admin`, `Trust & Safety`, `Finance`, `Support`) gates actions — e.g. only Finance/Super admin can refund or edit prices; only Trust & Safety/Super admin can verify, suspend or moderate.
- **Seller side**: allowed if `users.is_private_seller = 1`. A seller owns rows where `owner_user_id` / `user_id` / `requested_by` = their id.
- **Agency side**: allowed if the user has an `Active` (or `FFC pending`, read-mostly) membership. The active organisation is resolved from the membership and stored in the session.
  - **Principal / Admin** members: everything with their `organisation_id`, plus Team, Agency profile and Plan & billing.
  - **Agent** members: only listings where `owner_user_id` = self, leads where `assigned_user_id` = self, screenings they requested.
- Tenant scoping is enforced by Eloquent **global scopes** (`OwnedBySeller`, `OwnedByOrganisation`, `OwnedByAgent`) applied by portal middleware, and re-checked by **Policies** on every show/update/action. Admin routes run without tenant scopes.
- Suspended users/agencies are signed out on next request and cannot publish; their listings are hidden from the public site.

## Invariants

1. Every listing, lead, screening and invoice is owned by exactly one private seller **or** one organisation — never both, never neither (enforced by CHECK constraints and model validation).
2. Listing status changes go only through `TransitionListing`, which validates the transition, writes `listing_status_history`, writes `audit_log`, and dispatches notifications. No direct `->update(['status' => …])`.
3. A listing can reach `Pending review` only if its owner is verified (seller `Verified`, member `Active`, agency `Active`) and, for agencies, the plan's active-listing limit is not exceeded and the mandate expiry is in the future.
4. Seat, listing-limit and featured-credit checks run inside a DB transaction with `SELECT … FOR UPDATE` on the organisation's subscription row.
5. Invoice lines snapshot the price at time of sale; changing a plan, product or fee never modifies an existing invoice.
6. Money is stored as integer cents; VAT is computed once per invoice with `vat_rate_bp` stored on the invoice.
7. Seller- or agency-portal code never queries a tenant table without its global scope; `withoutGlobalScopes()` is allowed only in `app/Http/Admin`, jobs and webhooks.
8. Request handlers do not call external APIs synchronously except the payment redirect; emails, image resizing, provider calls and webhooks run on the queue.
9. `audit_log` is append-only — no updates or deletes from application code.
10. Private-disk files are never given a public URL.
11. Images reach S3 only through `StoreUploadedImage` → `ProcessUploadedImage`; no code calls `Storage::put()` with a raw upload. Compliance documents never get lighting edits.
