# Maison243

## Overview

Maison243 is a property marketplace for the Democratic Republic of the Congo (DRC) where homes are listed for sale or to rent by two kinds of lister: **private sellers** (owners listing their own property, paying once per listing) and **agencies** (estate agencies with principals and agents, paying a monthly subscription). The platform has three sides served from one Laravel application and one MySQL database:

1. **Admin portal** — Maison243 staff moderate listings, verify accounts (ID, title deeds, CIPC, PPRA/FFC), manage plans, prices and fees, and oversee screenings and payments.
2. **Seller portal** — private sellers create and pay for listings, handle leads, screen tenants, see performance and manage billing.
3. **Agency portal** — principals manage their team, plan, listings, leads and billing; agents manage only their own listings and leads.

It replaces the spreadsheet-and-email workflow of moderating listings and chasing payments with a single system of record where every listing, lead, screening and invoice is owned by exactly one seller or agency.

## Goals

1. Every new listing is reviewed by an admin before going live; median time from submission to decision under 1 working day.
2. No listing can go live from an unverified account (seller ID pending, agent FFC pending, agency pending).
3. Every rand charged is traceable: each invoice line snapshots the plan, product or fee price at the time of sale.
4. Agencies can never exceed their plan's seats, active-listing limit or featured credits.
5. A seller, agent or principal can never see or change another account's data.

## Core User Flow

**Private seller**
1. Seller signs up and uploads ID + proof of ownership (status `ID pending`).
2. Admin verifies the documents → seller becomes `Verified`.
3. Seller opens **Properties → Add new**, chooses a listing plan (Sale Listing, Sale Listing (Lite) or Rental Listing), then completes the property form that the plan unlocks.
4. Seller pays (card) → listing moves to `Pending review` and an invoice is issued.
5. Admin approves → listing goes `Live` for the plan's duration; or rejects with a reason → `Removed`.
6. Buyers/tenants enquire → leads appear in **Leads**; seller marks them `Contacted` / `Closed`.
7. For rentals, seller requests a tenant screening; applicant completes it; seller views the report.
8. Seller marks the listing `Under offer` → `Sold`, or `Let`; expired listings can be renewed.

**Agency**
1. Principal registers the agency (CIPC number, PPRA firm FFC) and picks a plan (Starter / Pro / Enterprise).
2. Admin verifies the agency → `Active`; subscription billed monthly by debit order.
3. Principal invites agents with their FFC numbers; admin (or the PPRA check) verifies each FFC → agent `Active`.
4. Agent creates a listing with mandate type (Sole/Open) and mandate expiry → submits → `Pending review` (counts against the plan's listing limit).
5. Admin approves → `Live`. Agent may spend a featured credit to feature it for 7 days.
6. Leads go to the listing agent; the principal can reassign them and sees the agent leaderboard.

**Admin**
1. Admin works the Overview queues: listings awaiting review, accounts to verify.
2. Admin manages listings, private sellers, agents, agencies, tenant screenings and payments from filterable tables with bulk actions and a detail drawer.
3. Admin changes plans, listing plans and fees in **Plans & pricing**; changes apply to new purchases and to existing subscribers at renewal.

## Features

### Admin portal
- Overview: count cards (live listings, awaiting review, accounts to verify, suspended), 12-week listing activity chart, listing mix gauge, review queue cards, verification queue.
- Tables for Listings, Private sellers, Agents, Agencies, Tenant screenings, Payments: search, status filters with counts, column sort, multi-select with bulk actions.
- Detail drawer per record: fields, related records (agency ↔ agents ↔ listings ↔ screenings ↔ payments), activity log, status-dependent actions, link to the account's portal.
- Moderation: approve / reject (with reason) / restore listings; verify / suspend / reinstate accounts; destructive actions confirm with a reason sent to the account holder.
- Add private seller, agent or agency (created as pending, invitation emailed).
- Plans & pricing: agency plans (price excl. VAT, seats, listing limit, featured credits, analytics), seller listing plans (price incl. VAT, deal, months, max photos, max asking price), other fees (screening fee, featured credit top-up), VAT display toggle, annual discount. Add / edit / archive / restore.
- Payments: mark paid (EFT), send reminder, refund.

### Seller portal
- Properties: list with search, pagination, status tags and status-dependent row actions (Publish, Renew, Edit, Under offer / Mark let, Mark sold, Unpublish, Relist).
- Add new: plan picker first (Sale Listing / Sale Listing (Lite) / Rental Listing); the property form appears after a plan is chosen and is constrained by it (deal, photo limit, max asking price).
- Photo upload: drag-and-drop multiple photos up to the plan's limit; each tile shows "Optimising…" until processing finishes, then the enhanced image; first photo is the cover; reorder and delete.
- Leads inbox with filters (All / New / Contacted / Closed), lead detail with email/call links and status actions.
- Tenant screenings: request by email invite, resend, view report (ID, credit, affordability, judgements, landlord reference).
- Performance: views, enquiries, saves, enquiry rate; 30-day daily views chart; per-listing table.
- Profile (details, notification toggles, verification status), Billing (active packages, invoices, pay now, payment card), Help (FAQ, contact).

### Agency portal
- Role-aware: **principal** sees the whole agency; **agent** sees only their own listings, leads, screenings and performance.
- Listings with status groups (All, Live, In review, Drafts, Under offer, Expired, Closed), agent filter (principal), mandate type + expiry (red under 30 days), Featured tag, quota line (active listings / limit, credits left).
- New listing form adds listing agent (principal), mandate type and mandate expiry; FFC-pending agents can only save drafts.
- Leads with reassignment (principal); tenant screenings; performance with agent leaderboard (principal).
- Team (principal): seats bar, invite with FFC validation, resend / cancel invite, deactivate / reactivate.
- Agency profile (principal) / My profile (agent); Plan & billing (principal): usage bars, change plan with downgrade guards, invoices, debit order.

## Scope

### In Scope
- One Laravel 11 application serving admin, seller and agency portals on separate route groups/subdomains.
- One MySQL 8 database (schema in `database/maison243_schema.sql`, Laravel migrations in `database/laravel/`).
- Account verification workflow (manual admin checks with documents).
- Listing lifecycle, moderation and expiry jobs (listing plan expiry, mandate expiry, featured expiry, monthly credit reset).
- Invoicing with VAT, card payments and debit orders through a payment gateway (PayFast or Paystack).
- Tenant screening request/invite/report flow (provider integration behind an interface).
- Email notifications (invites, review decisions, new leads, payment reminders).
- Image upload pipeline: every uploaded image is auto-rotated, stripped of EXIF/GPS, light-corrected (listing photos and avatars only), resized into variants, compressed to WebP/JPEG and stored in S3; raw originals are discarded.

### Out of Scope
- The public property search/browse website (the landing page exists as a design only).
- Native mobile apps.
- Automated PPRA/Home Affairs/credit-bureau API integrations (admin verifies manually in v1; screening provider is stubbed).
- In-app chat or messaging between buyers and listers (leads link out to email/phone/WhatsApp).
- Multi-language UI (English only).
- Commission tracking, deal/OTP management or trust accounting for agencies.

## Success Criteria

1. A private seller can sign up, be verified by an admin, choose a listing plan, complete the form, pay, and see the listing go `Live` after admin approval.
2. An admin can reject a listing with a reason, and the seller sees the listing as `Removed` with that reason.
3. A principal can invite an agent; the agent cannot submit a listing until their FFC is verified.
4. An agency on Starter (25 listings, 3 seats) is blocked from submitting a 26th active listing and from inviting a 4th member.
5. An agent logged into the agency portal cannot load another agent's lead by URL (403), and no seller can load any agency record.
6. Changing a plan price in Plans & pricing does not alter any existing invoice total.
7. Every approve / reject / verify / suspend / refund action writes one `audit_log` row with actor, before and after values.
8. A dark phone photo uploaded to a listing appears on the listing brighter, under 400 KB for the large variant, correctly rotated, with no GPS data, served from S3 — and the raw upload no longer exists anywhere.
9. An uploaded ID document is stored only in the private bucket, with lighting unchanged, and opens only through a signed URL that expires.
