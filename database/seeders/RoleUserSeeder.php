<?php

namespace Database\Seeders;

use App\Models\Organisation;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoleUserSeeder extends Seeder
{
    /**
     * Seed one login per portal: admin, private seller and agency principal.
     * Every account uses the password "password".
     */
    public function run(): void
    {
        $admin = User::factory()->create([
            'first_name' => 'Ada',
            'last_name' => 'Admin',
            'email' => 'admin@maison243.test',
        ]);
        $admin->platformStaff()->create(['role' => 'Super admin', 'is_active' => true]);

        User::factory()->seller()->create([
            'first_name' => 'Sam',
            'last_name' => 'Seller',
            'email' => 'seller@maison243.test',
        ]);

        $agency = Organisation::factory()->create([
            'name' => 'Jacaranda Estates',
            'email' => 'office@jacaranda.test',
            'city' => 'Pretoria',
            'province' => 'Gauteng',
        ]);
        $principal = User::factory()->create([
            'first_name' => 'Pat',
            'last_name' => 'Principal',
            'email' => 'agency@maison243.test',
        ]);
        $agency->memberships()->create([
            'user_id' => $principal->id,
            'role' => 'Principal',
            'status' => 'Active',
            'joined_at' => now(),
        ]);
    }
}
