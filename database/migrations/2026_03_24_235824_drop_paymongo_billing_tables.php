<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('subscriptions');
    }

    public function down(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('plan', ['pro_monthly', 'pro_yearly']);
            $table->enum('status', ['active', 'cancelled', 'past_due', 'expired'])->default('active');
            $table->string('paymongo_subscription_id')->unique()->nullable();
            $table->string('paymongo_payment_method_id')->nullable();
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->string('paymongo_payment_id')->unique();
            $table->unsignedInteger('amount');
            $table->string('currency')->default('PHP');
            $table->string('status');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }
};
