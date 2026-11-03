# AI Workflow Rules

## Approach

Build Maison243 incrementally using a spec-driven workflow. The context files define what to build (`project-overview.md`), how it is structured (`architecture.md`), how code is written (`code-standards.md`), how it looks (`ui-context.md`) and what is done (`progress-tracker.md`). The HTML designs (`Maison243 Admin v2`, `Seller Portal`, `Agency Portal`) and the schema in `database/` are the source of truth for screens and data. Always implement against these specs — do not infer or invent behaviour.

Recommended build order:
1. Foundation — Laravel app, migrations, `ReferenceDataSeeder`, auth, portal middleware, tenant scopes, `AuditLogger`, shared Blade components, S3 disks + `media` queue worker.
2. Media — `StoreUploadedImage`, `ImagePipeline`, `ProcessUploadedImage`, `<x-photo-uploader>` (needed by listings, logos, avatars and verification documents).
3. Accounts — sign-up, invites, memberships, verifications (admin verify/suspend).
4. Listings — `TransitionListing`, seller Add new (plan → form), agency listing form, admin moderation.
5. Billing — invoices, VAT, payment gateway, subscriptions, credits, Plans & pricing.
6. Leads, Screenings, Performance.
7. Scheduled jobs and notifications.

## Scoping Rules

- Work on one feature unit at a time (e.g. "Admin: approve/reject listing").
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries (`app/Domain/*`, portals) in a single step.
- Build the Domain Action and its tests before the portal UI that calls it.
- Implement one portal's screen at a time, even when the same feature exists in all three.

## When to Split Work

Split an implementation step if it combines:

- Domain logic changes and UI changes for more than one portal.
- A schema migration and the feature that uses it.
- Payment gateway or screening provider integration and the screens that trigger it.
- Scheduled jobs and the interactive flows they affect.
- Image pipeline tuning (`config/images.php`, `ImagePipeline`) and the screens that upload images.
- Behaviour not clearly defined in the context files or designs.

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behaviour not defined in the context files or designs.
- If a requirement is ambiguous, resolve it in the relevant context file before implementing.
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing.
- Prices, plan limits, fees and status names come from `ReferenceDataSeeder` and the enums — never hard-code them in views.

## Protected Files

Do not modify the following unless explicitly instructed:

- `database/maison243_schema.sql` and existing migrations once run — add a new migration instead.
- `database/seeders/ReferenceDataSeeder.php` prices and limits (change them through Plans & pricing or a new seeder).
- `app/Domain/Audit/*` and the append-only rule for `audit_log`.
- `app/Domain/Media/ImagePipeline.php` processing order and the rule that `document` images get no lighting edits; change tuning only through `config/images.php`.
- The design reference files (`*.dc.html`).
- `vendor/`, `node_modules/` and any third-party package internals.

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or boundaries → `architecture.md`
- Storage model or schema decisions → `architecture.md` + new migration
- Code conventions or standards → `code-standards.md`
- Visual tokens or components → `ui-context.md`
- Feature scope → `project-overview.md`
- Progress and open questions → `progress-tracker.md`

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope, in the portal(s) it targets.
2. No invariant defined in `architecture.md` was violated (tenant scoping, `TransitionListing`, price snapshots, audit log).
3. Tenant-isolation and policy tests for the unit pass.
4. If the unit handles uploads: a sample photo is processed by the queue, its variants exist in S3, the temp file is deleted, and no raw original was stored.
5. `php artisan test`, `./vendor/bin/pint --test` and `./vendor/bin/phpstan analyse` pass.
6. `npm run build` passes.
7. `progress-tracker.md` reflects the completed work.
