<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('invoice_no', 20)->unique();
            $table->foreignId('user_id')->nullable()->constrained(); // private seller
            $table->foreignId('organisation_id')->nullable()->constrained(); // agency
            $table->string('status', 20)->default('Due');
            $table->date('issued_on');
            $table->date('due_on');
            $table->unsignedBigInteger('subtotal_cents'); // excl. VAT
            $table->unsignedSmallInteger('vat_rate_bp')->default(1500); // 15.00%
            $table->unsignedBigInteger('vat_cents');
            $table->unsignedBigInteger('total_cents');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'issued_on']);
            $table->index(['organisation_id', 'issued_on']);
            $table->index(['status', 'due_on']);
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_inv_status' => "status IN ('Due','Paid','Overdue','Refunded','Void')",
                'chk_inv_owner' => "(user_id IS NULL) <> (organisation_id IS NULL)",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `invoices` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }

        Schema::create('invoice_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->cascadeOnDelete();
            $table->string('kind', 20);
            $table->string('description', 200);
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedBigInteger('unit_cents_excl_vat');
            $table->unsignedBigInteger('line_cents_excl_vat');
            $table->foreignId('subscription_id')->nullable()->constrained();
            $table->foreignId('listing_id')->nullable()->constrained();
            $table->foreignId('listing_product_id')->nullable()->constrained();
            $table->foreignId('screening_id')->nullable()->constrained();
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_il_kind' => "kind IN ('Subscription','Listing plan','Screening','Credits','Adjustment')",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `invoice_lines` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained();
            $table->bigInteger('amount_cents'); // negative = refund
            $table->string('method', 20);
            $table->string('gateway', 20)->nullable(); // PayFast, Paystack…
            $table->string('gateway_ref', 80)->nullable();
            $table->string('status', 20)->default('Succeeded');
            $table->foreignId('recorded_by')->nullable()->constrained('users'); // admin marking EFT paid
            $table->timestamp('created_at')->useCurrent();
            $table->unique(['gateway', 'gateway_ref']);
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_pay_method' => "method IN ('Card','Debit order','EFT','Instant EFT','Refund')",
                'chk_pay_status' => "status IN ('Pending','Succeeded','Failed')",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `payments` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }

        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained();
            $table->foreignId('organisation_id')->nullable()->constrained();
            $table->string('kind', 20);
            $table->string('label', 80); // "Visa •••• 4821"
            $table->string('gateway_token', 120); // never store card numbers
            $table->boolean('is_default')->default(true);
            $table->timestamps();
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_pm_kind' => "kind IN ('Card','Debit order')",
                'chk_pm_owner' => "(user_id IS NULL) <> (organisation_id IS NULL)",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `payment_methods` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }

        Schema::create('credit_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organisation_id')->constrained();
            $table->integer('delta'); // +grant / -spend
            $table->string('reason', 30);
            $table->foreignId('listing_id')->nullable()->constrained();
            $table->foreignId('invoice_id')->nullable()->constrained();
            $table->foreignId('created_by')->nullable()->constrained('users');
            $table->timestamp('created_at')->useCurrent();
            $table->index(['organisation_id', 'created_at']);
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_cl_reason' => "reason IN ('Monthly grant','Monthly reset','Top-up','Feature listing','Admin adjustment')",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `credit_ledger` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('credit_ledger');
        Schema::dropIfExists('payment_methods');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('invoice_lines');
        Schema::dropIfExists('invoices');
    }
};
