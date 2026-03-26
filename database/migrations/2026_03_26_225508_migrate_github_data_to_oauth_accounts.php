<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->whereNotNull('github_id')
            ->orderBy('id')
            ->each(function ($user) {
                DB::table('oauth_accounts')->insertOrIgnore([
                    'user_id' => $user->id,
                    'provider' => 'github',
                    'provider_user_id' => $user->github_id,
                    'token' => $user->github_token,
                    'avatar' => $user->avatar,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            });
    }

    public function down(): void
    {
        DB::table('oauth_accounts')->where('provider', 'github')->delete();
    }
};
