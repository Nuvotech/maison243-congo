<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organisation_id')->constrained();
            $table->foreignId('user_id')->constrained();
            $table->string('role', 20);
            $table->string('status', 20)->default('Invited');
            $table->string('ffc_number', 30)->nullable();
            $table->date('ffc_valid_until')->nullable();
            $table->string('branch', 80)->nullable();
            $table->foreignId('invited_by')->nullable()->constrained('users');
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();
            $table->unique(['organisation_id', 'user_id']);
            $table->index(['user_id', 'status']);
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_mem_role' => "role IN ('Principal','Agent','Admin')",
                'chk_mem_status' => "status IN ('Invited','FFC pending','Active','Suspended','Deactivated')",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `memberships` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('memberships');
    }
};
