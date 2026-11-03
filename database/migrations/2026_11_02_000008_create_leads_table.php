<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('listing_id')->constrained();
            $table->foreignId('assigned_user_id')->constrained('users');
            $table->foreignId('organisation_id')->nullable()->constrained(); // copied from listing for scoping
            $table->string('name', 120);
            $table->string('email', 190)->nullable();
            $table->string('phone', 30)->nullable();
            $table->text('message')->nullable();
            $table->string('channel', 20)->default('Enquiry form');
            $table->string('status', 20)->default('New');
            $table->timestamp('first_reply_at')->nullable();
            $table->timestamps();
            $table->index(['assigned_user_id', 'status', 'created_at']);
            $table->index(['organisation_id', 'status', 'created_at']);
            $table->index(['listing_id', 'created_at']);
        });
        if (DB::getDriverName() === 'mysql') {
            foreach ([
                'chk_lead_channel' => "channel IN ('Enquiry form','WhatsApp','Call back','Email')",
                'chk_lead_status' => "status IN ('New','Contacted','Closed')",
            ] as $name => $expr) {
                DB::statement("ALTER TABLE `leads` ADD CONSTRAINT `$name` CHECK ($expr)");
            }
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
