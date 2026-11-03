<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organisation_id')->constrained();
            $table->foreignId('agency_plan_id')->constrained();
            $table->string('status', 20)->default('Active');
            $table->string('billing_cycle', 10)->default('Monthly');
            $table->date('current_period_start');
            $table->date('current_period_end');
            $table->string('payment_method', 20)->default('Debit order');
            $table->string('gateway_ref', 80)->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
            $table->index(['organisation_id', 'status']);
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_sub_status' => "status IN ('Active','Past due','Cancelled')",
                'chk_sub_cycle' => "billing_cycle IN ('Monthly','Annual')",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `subscriptions` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
