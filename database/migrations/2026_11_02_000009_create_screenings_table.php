<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('screenings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained();
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('organisation_id')->nullable()->constrained();
            $table->string('applicant_name', 120);
            $table->string('applicant_email', 190);
            $table->char('invite_token_hash', 64)->nullable();
            $table->string('status', 20)->default('Invite sent');
            $table->string('result', 20)->nullable();
            $table->timestamp('consent_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->string('report_path')->nullable(); // private disk
            $table->json('report_summary')->nullable();
            $table->string('provider_ref', 80)->nullable();
            $table->timestamps();
            $table->index(['requested_by', 'status']);
            $table->index(['organisation_id', 'status']);
            $table->index(['status', 'updated_at']);
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_scr_status' => "status IN ('Invite sent','In progress','Complete','Cancelled')",
                'chk_scr_result' => "result IS NULL OR result IN ('Recommended','Not recommended')",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `screenings` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('screenings');
    }
};
