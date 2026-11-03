<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agency_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name', 60)->unique();
            $table->unsignedBigInteger('price_cents_excl_vat');
            $table->unsignedInteger('seats')->default(0); // 0 = unlimited
            $table->unsignedInteger('listing_limit')->default(0); // 0 = unlimited
            $table->unsignedInteger('featured_credits')->default(0); // per month
            $table->string('analytics', 20)->default('Basic');
            $table->string('status', 20)->default('Active');
            $table->timestamps();
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_ap_status' => "status IN ('Active','Archived')",
                'chk_ap_analytics' => "analytics IN ('Basic','Full','Full + API')",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `agency_plans` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }

        Schema::create('listing_products', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique(); // SALE, SALE_LITE, RENTAL
            $table->string('name', 80);
            $table->string('deal', 10);
            $table->unsignedBigInteger('price_cents_incl_vat');
            $table->unsignedInteger('months');
            $table->unsignedInteger('max_photos');
            $table->unsignedBigInteger('max_asking_cents')->default(0); // 0 = no limit
            $table->string('status', 20)->default('Active');
            $table->timestamps();
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_lp_deal' => "deal IN ('Sale','Rent')",
                'chk_lp_status' => "status IN ('Active','Archived')",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `listing_products` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }

        Schema::create('platform_settings', function (Blueprint $table) {
            $table->string('setting_key', 60)->primary();
            $table->string('setting_value');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
        Schema::dropIfExists('listing_products');
        Schema::dropIfExists('agency_plans');
    }
};
