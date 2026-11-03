<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->ulid('public_id')->unique();
            $table->string('email', 190)->unique();
            $table->string('password')->nullable(); // null until invite accepted
            $table->string('first_name', 80);
            $table->string('last_name', 80);
            $table->string('phone', 30)->nullable();
            $table->string('city', 80)->nullable();
            $table->string('avatar_path')->nullable();
            $table->text('bio')->nullable();
            $table->boolean('is_private_seller')->default(false);
            $table->string('seller_status', 20)->nullable();
            $table->boolean('notify_leads')->default(true);
            $table->boolean('notify_whatsapp')->default(true);
            $table->boolean('notify_weekly')->default(false);
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_users_seller_status' => "seller_status IS NULL OR seller_status IN ('ID pending','Verified','Suspended')",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `users` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
