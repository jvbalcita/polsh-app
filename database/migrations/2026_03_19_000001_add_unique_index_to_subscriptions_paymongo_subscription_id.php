<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('subscriptions as duplicate')
            ->join('subscriptions as original', function ($join): void {
                $join->on('duplicate.paymongo_subscription_id', '=', 'original.paymongo_subscription_id')
                    ->whereColumn('duplicate.id', '>', 'original.id');
            })
            ->whereNotNull('duplicate.paymongo_subscription_id')
            ->update([
                'duplicate.paymongo_subscription_id' => DB::raw("CONCAT(duplicate.paymongo_subscription_id, ':duplicate:', duplicate.id)"),
            ]);

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropIndex('subscriptions_paymongo_subscription_id_index');
            $table->unique('paymongo_subscription_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropUnique('subscriptions_paymongo_subscription_id_unique');
            $table->index('paymongo_subscription_id');
        });
    }
};
