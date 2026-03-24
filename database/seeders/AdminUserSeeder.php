<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RoleSeeder::class);

        $password = config('admin.password');

        if (! $password) {
            $this->command->warn('ADMIN_PASSWORD not set in .env — skipping admin seeder.');

            return;
        }

        $admin = User::firstOrCreate(
            ['email' => config('admin.email')],
            [
                'name' => config('admin.name'),
                'password' => Hash::make($password),
                'email_verified_at' => now(),
            ],
        );

        $admin->assignRole('admin');

        $this->command->info("Admin user ready: {$admin->email}");
    }
}
