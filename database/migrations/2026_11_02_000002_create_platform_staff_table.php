<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('platform_staff', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->primary();
            $table->foreign('user_id')->references('id')->on('users');
            $table->string('role', 30);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_staff_role' => "role IN ('Super admin','Trust & Safety','Finance','Support')",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `platform_staff` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_staff');
    }
};
