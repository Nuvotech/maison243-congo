# Code Standards

## General

- Keep classes small and single-purpose: one Action class per business operation (`ApproveListing`, `InviteMember`, `RefundPayment`).
- Business rules live in `app/Domain`, never in controllers, Livewire components or Blade views.
- Fix root causes; do not add per-page workarounds for a domain rule.
- Do not mix portals: admin, seller and agency code never import each other's controllers or components.
- Name things the way the UI does: `Pending review`, `Under offer`, `FFC pending`, `Sale Listing (Lite)` — status strings in code match the labels shown to users.
- Every user-visible action that changes state shows a toast on success and an inline error on failure (never a silent no-op).

## PHP

- PHP 8.3, `declare(strict_types=1);` in every file.
- Typed properties, parameters and return types everywhere; no `mixed` unless unavoidable.
- Backed enums for every status and fixed list (`ListingStatus`, `MembershipRole`, `MembershipStatus`, `InvoiceStatus`, `ScreeningStatus`, `LeadStatus`, `Deal`, `PropertyType`, `MandateType`). Cast enum columns in models.
- Money is a `Money` value object (cents + currency) — never floats. Format with a single helper: `R 3 490` for whole rands, `R 4 013,50` style handled by `Money::format()`.
- Laravel Pint (PSR-12 preset) and Larastan level 6 must pass.
- Validate all external input (requests, webhooks, CSV imports) with Form Requests or dedicated validators before it reaches a domain Action.

## Laravel

- Routes split per portal: `routes/admin.php`, `routes/seller.php`, `routes/agency.php`, each with its own middleware group (`auth`, `verified`, `portal:admin|seller|agency`).
- Controllers are thin: authorize → validate → call one Action → return a view, redirect or Livewire response.
- Use Livewire components for interactive tables (search, filter, sort, select, bulk actions), drawers, dialogs and multi-step forms. Keep component state minimal; load data in `render()` through query objects.
- Authorization: every model has a Policy; call `$this->authorize()` / `Gate::authorize()` before any read of a single record and before every mutation.
- Tenant global scopes are applied by portal middleware; never call `withoutGlobalScopes()` outside admin, jobs or webhooks.
- Long-running or external work goes to queued Jobs (mail, image resize, gateway calls, screening provider calls).
- Scheduled jobs are idempotent and safe to re-run.
- Use database transactions for any Action that writes more than one table; lock the subscription row for quota/credit checks.
- Eager-load relations in table queries; no N+1 (enable `Model::preventLazyLoading()` outside production).

## Styling

- Tailwind with the design tokens defined in `ui-context.md`, exposed as CSS variables in `resources/css/app.css` and mapped in `tailwind.config.js`. No hard-coded hex values in Blade.
- Use the shared Blade components in `resources/views/components` (`<x-button>`, `<x-tag>`, `<x-card>`, `<x-table>`, `<x-drawer>`, `<x-dialog>`, `<x-seg>`, `<x-stat-card>`) instead of re-styling raw elements.
- Follow the radius scale and spacing in `ui-context.md`; status tags always use the status→tone mapping, never a one-off colour.
- Every interactive element has hover, active and `focus-visible` states.
- Layouts must reflow down to 360px wide: tables scroll horizontally inside their card; sidebars collapse to a top bar under 960px.

## HTTP, Livewire actions and Webhooks

- Validate and parse input before any logic runs (Form Request or `$this->validate()` in Livewire).
- Enforce auth, portal and ownership before any mutation.
- Destructive actions (reject, remove, suspend, refund, cancel screening) require a confirmation dialog and accept an optional reason that is stored in `audit_log` and emailed to the account holder.
- JSON endpoints (webhooks, internal APIs) return `{ "data": … }` on success and `{ "message": …, "errors": {…} }` on failure with correct status codes (200/201/204, 403, 404, 409, 422).
- Webhooks verify signatures, are idempotent on `gateway_ref`, and only enqueue work.

## Data and Storage

- All records and relationships belong in MySQL; schema changes only via Laravel migrations in `database/migrations`.
- Money as integer cents; dates/times stored in UTC and displayed in `Africa/Johannesburg`.
- Photos and documents go to object storage; the DB stores only paths. Private documents use the `private` disk and signed URLs.
- All image uploads use `StoreUploadedImage` with a profile (`listing_photo`, `agency_logo`, `avatar`, `document`) and `ImageUploadRule`; never write an uploaded image to S3 directly. Show a processing state until `media.status` is `Ready`.
- Never store card numbers, CVVs or bank account numbers — only gateway tokens and references.
- Use soft deletes for users, organisations and listings; never hard-delete records that invoices or the audit log reference.
- Every state-changing Action writes one `audit_log` entry via `AuditLogger` (actor, side, action, entity, reason, before, after).

## Testing

- Pest feature tests for every Action and every portal route group.
- A tenant-isolation test suite: seller A cannot read seller B; agent cannot read another agent's lead; principal cannot read another agency; non-staff cannot open admin routes.
- Quota tests: seats, listing limit and featured credits at the boundary.
- Money tests: VAT and annual-discount calculations, price snapshot on invoice lines.
- Media tests: fake S3 disk; each profile produces its variants, EXIF is stripped, rotation is applied, `document` has no lighting edits, temp file is deleted, invalid/too-small images end as `Failed`.

## File Organization

- `app/Domain/{Listings,Accounts,Billing,Leads,Screenings,Media,Audit}/` — Models, Enums, Actions, Policies, Events, Jobs, Services for that domain.
- `config/images.php` — image profiles, variant sizes, quality and lighting tuning.
- `app/Http/Admin/`, `app/Http/Seller/`, `app/Http/Agency/` — controllers, Form Requests and Livewire components per portal.
- `app/Http/Webhooks/` — gateway and screening provider webhook controllers.
- `app/Support/` — cross-cutting helpers (`Money`, `Vat`, date formatting).
- `resources/views/components/` — shared UI components.
- `resources/views/{admin,seller,agency}/` — portal layouts and pages.
- `database/migrations/`, `database/seeders/` — schema and reference data (`ReferenceDataSeeder`).
- `tests/Feature/{Admin,Seller,Agency,Isolation}/`, `tests/Unit/` — tests mirroring the structure above.
