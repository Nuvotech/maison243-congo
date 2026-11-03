<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('actor_user_id')->nullable()->constrained('users');
            $table->string('actor_side', 10);
            $table->string('action', 60); // listing.approve, member.suspend…
            $table->string('entity_type', 30);
            $table->unsignedBigInteger('entity_id');
            $table->string('reason', 500)->nullable();
            $table->json('before_data')->nullable();
            $table->json('after_data')->nullable();
            $table->ipAddress()->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['entity_type', 'entity_id', 'created_at']);
            $table->index(['actor_user_id', 'created_at']);
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_audit_side' => "actor_side IN ('admin','seller','agency','system')",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `audit_log` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_log');
    }
};
