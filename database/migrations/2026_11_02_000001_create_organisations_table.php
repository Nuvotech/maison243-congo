<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organisations', function (Blueprint $table) {
            $table->id();
            $table->ulid('public_id')->unique();
            $table->string('name', 160);
            $table->string('cipc_reg_no', 30)->nullable()->unique();
            $table->string('ppra_firm_ffc', 30)->nullable();
            $table->string('vat_no', 20)->nullable();
            $table->string('address')->nullable();
            $table->string('city', 80)->nullable();
            $table->string('province', 40)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email', 190)->nullable();
            $table->string('website', 190)->nullable();
            $table->string('logo_path')->nullable();
            $table->text('about')->nullable();
            $table->string('status', 20)->default('Pending')->index();
            $table->timestamps();
            $table->softDeletes();
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_org_status' => "status IN ('Pending','Active','Suspended')",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `organisations` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('organisations');
    }
};
