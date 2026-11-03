<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('verifications', function (Blueprint $table) {
            $table->id();
            $table->string('subject_type', 20); // user | organisation | membership
            $table->unsignedBigInteger('subject_id');
            $table->string('kind', 30);
            $table->string('status', 20)->default('Pending');
            $table->string('document_path')->nullable(); // private disk
            $table->string('reference', 80)->nullable();
            $table->foreignId('checked_by')->nullable()->constrained('users');
            $table->timestamp('checked_at')->nullable();
            $table->string('notes', 500)->nullable();
            $table->timestamps();
            $table->index(['subject_type', 'subject_id']);
            $table->index(['status', 'created_at']);
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_ver_subject' => "subject_type IN ('user','organisation','membership')",
                'chk_ver_kind' => "kind IN ('ID document','Proof of ownership','CIPC','PPRA firm','FFC','Trust audit')",
                'chk_ver_status' => "status IN ('Pending','Verified','Rejected')",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `verifications` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('verifications');
    }
};
