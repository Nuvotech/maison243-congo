<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->string('list_no', 20)->unique();
            $table->foreignId('owner_user_id')->constrained('users'); // private seller OR listing agent
            $table->foreignId('organisation_id')->nullable()->constrained(); // null = private listing
            $table->string('status', 20)->default('Draft');
            $table->string('deal', 10);
            $table->string('property_type', 20);
            $table->string('street', 160);
            $table->string('unit_complex', 160)->nullable();
            $table->string('suburb', 80);
            $table->string('city', 80);
            $table->string('province', 40);
            $table->geography('location', subtype: 'point', srid: 4326)->nullable();
            $table->unsignedBigInteger('price_cents'); // rent = per month
            $table->unsignedTinyInteger('bedrooms')->nullable();
            $table->decimal('bathrooms', 3, 1)->nullable();
            $table->unsignedInteger('floor_size_m2')->nullable();
            $table->unsignedInteger('erf_size_m2')->nullable();
            $table->string('title', 160)->nullable();
            $table->text('description')->nullable();
            $table->json('features')->nullable();
            $table->foreignId('listing_product_id')->nullable()->constrained(); // private seller plan
            $table->string('mandate_type', 10)->nullable(); // agency only
            $table->date('mandate_expires_on')->nullable()->index();
            $table->timestamp('featured_until')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users');
            $table->string('rejection_reason', 500)->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['organisation_id', 'status']);
            $table->index(['owner_user_id', 'status']);
            $table->index(['status', 'deal', 'city', 'suburb', 'price_cents'], 'listings_search_index');
            $table->index(['status', 'submitted_at'], 'listings_review_queue_index');
            $table->fullText(['title', 'suburb', 'description']);
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_lst_status' => "status IN ('Draft','Pending review','Live','Under offer','Sold','Let','Expired','Withdrawn','Removed')",
                'chk_lst_deal' => "deal IN ('Sale','Rent')",
                'chk_lst_type' => "property_type IN ('House','Apartment','Townhouse','Cluster','Vacant land','Farm','Commercial')",
                'chk_lst_mandate' => "mandate_type IS NULL OR mandate_type IN ('Sole','Open')",
                'chk_lst_kind' => "(organisation_id IS NULL AND mandate_type IS NULL) OR (organisation_id IS NOT NULL AND listing_product_id IS NULL)",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `listings` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }

        Schema::create('listing_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->unsignedSmallInteger('sort_order')->default(0); // 0 = cover
            $table->string('caption', 160)->nullable();
            $table->timestamps();
            $table->index(['listing_id', 'sort_order']);
        });

        Schema::create('listing_status_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained();
            $table->string('from_status', 20)->nullable();
            $table->string('to_status', 20);
            $table->foreignId('changed_by')->nullable()->constrained('users');
            $table->string('reason', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['listing_id', 'created_at']);
        });

        Schema::create('listing_daily_stats', function (Blueprint $table) {
            $table->foreignId('listing_id')->constrained();
            $table->date('stat_date');
            $table->unsignedInteger('views')->default(0);
            $table->unsignedInteger('saves')->default(0);
            $table->unsignedInteger('enquiries')->default(0);
            $table->primary(['listing_id', 'stat_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listing_daily_stats');
        Schema::dropIfExists('listing_status_history');
        Schema::dropIfExists('listing_photos');
        Schema::dropIfExists('listings');
    }
};
