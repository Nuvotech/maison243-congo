<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW v_org_usage AS
            SELECT o.id AS organisation_id, o.name, ap.name AS plan,
                   ap.seats, ap.listing_limit, ap.featured_credits,
                   (SELECT COUNT(*) FROM memberships m
                     WHERE m.organisation_id = o.id AND m.status IN ('Invited','FFC pending','Active')) AS seats_used,
                   (SELECT COUNT(*) FROM listings l
                     WHERE l.organisation_id = o.id AND l.deleted_at IS NULL
                       AND l.status IN ('Pending review','Live','Under offer')) AS active_listings,
                   (SELECT COALESCE(SUM(c.delta), 0) FROM credit_ledger c WHERE c.organisation_id = o.id) AS credits_balance
            FROM organisations o
            LEFT JOIN subscriptions s ON s.organisation_id = o.id AND s.status = 'Active'
            LEFT JOIN agency_plans ap ON ap.id = s.agency_plan_id
        SQL);

        DB::statement(<<<'SQL'
            CREATE OR REPLACE VIEW v_admin_review_queue AS
            SELECT l.id, l.list_no, l.deal, l.property_type, l.suburb, l.city, l.price_cents, l.submitted_at,
                   u.first_name, u.last_name, o.name AS agency
            FROM listings l
            JOIN users u ON u.id = l.owner_user_id
            LEFT JOIN organisations o ON o.id = l.organisation_id
            WHERE l.status = 'Pending review' AND l.deleted_at IS NULL
        SQL);
    }

    public function down(): void
    {
        DB::statement('DROP VIEW IF EXISTS v_admin_review_queue');
        DB::statement('DROP VIEW IF EXISTS v_org_usage');
    }
};
