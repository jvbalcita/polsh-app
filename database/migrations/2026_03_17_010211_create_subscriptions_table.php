<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('plan', ['pro_monthly', 'pro_yearly']);
            $table->enum('status', ['active', 'cancelled', 'past_due', 'expired'])->default('active');
            $table->string('paymongo_subscription_id')->nullable()->index();
            $table->string('paymongo_payment_method_id')->nullable();
            $table->timestamp('current_period_start');
            $table->timestamp('current_period_end');
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
