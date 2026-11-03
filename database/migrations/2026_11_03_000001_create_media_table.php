<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->ulid('public_id')->unique();
            $table->morphs('owner');                         // listing, organisation, user, verification
            $table->string('profile', 30);                   // listing_photo | agency_logo | avatar | document
            $table->string('disk', 30);
            $table->string('status', 20)->default('Processing');
            $table->string('temp_path')->nullable();         // local raw file until processed
            $table->string('original_name')->nullable();
            $table->unsignedBigInteger('original_bytes')->nullable();
            $table->json('variants')->nullable();            // {"large":{"path","width","height","bytes","mime"},…}
            $table->unsignedBigInteger('stored_bytes')->nullable();
            $table->boolean('lighting_applied')->default(false);
            $table->string('error', 255)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->foreignId('uploaded_by')->nullable()->constrained('users');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            $table->index(['owner_type', 'owner_id', 'sort_order']);
            $table->index(['status', 'created_at']);
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `media` ADD CONSTRAINT `chk_media_status` CHECK (status IN ('Processing','Ready','Failed'))");
            DB::statement("ALTER TABLE `media` ADD CONSTRAINT `chk_media_profile` CHECK (profile IN ('listing_photo','agency_logo','avatar','document'))");
        }

        Schema::table('listing_photos', function (Blueprint $table) {
            $table->foreignId('media_id')->nullable()->after('listing_id')->constrained('media')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('listing_photos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('media_id');
        });
        Schema::dropIfExists('media');
    }
};
