<?php

use App\Models\Membership;
use App\Models\PlatformStaff;
use App\Models\User;
use Database\Seeders\RoleUserSeeder;

test('each seeded role logs in and lands in its own portal', function (string $email, string $portal) {
    $this->seed(RoleUserSeeder::class);

    $this->post(route('login.store'), ['email' => $email, 'password' => 'password'])
        ->assertRedirect(route('dashboard', absolute: false));

    $this->get(route('dashboard'))->assertRedirect(route("portals.{$portal}"));
    $this->get(route("portals.{$portal}"))->assertOk();
})->with([
    'admin' => ['admin@maison243.test', 'admin'],
    'seller' => ['seller@maison243.test', 'seller'],
    'agency principal' => ['agency@maison243.test', 'agency'],
]);

test('agency agents are sent to the agency portal', function () {
    $agent = User::factory()->agency('Agent')->create();

    $this->actingAs($agent)
        ->get(route('dashboard'))
        ->assertRedirect(route('portals.agency'));
});

test('users cannot open another role\'s portal', function (Closure $makeUser, string $forbiddenPortal) {
    $this->actingAs($makeUser())
        ->get(route("portals.{$forbiddenPortal}"))
        ->assertForbidden();
})->with([
    'seller into admin' => [fn () => User::factory()->seller()->create(), 'admin'],
    'seller into agency' => [fn () => User::factory()->seller()->create(), 'agency'],
    'agency into admin' => [fn () => User::factory()->agency()->create(), 'admin'],
    'agency into seller' => [fn () => User::factory()->agency()->create(), 'seller'],
    'admin into seller' => [fn () => User::factory()->admin()->create(), 'seller'],
    'admin into agency' => [fn () => User::factory()->admin()->create(), 'agency'],
    'user without a role into seller' => [fn () => User::factory()->create(), 'seller'],
]);

test('deactivated staff lose access to the admin portal', function () {
    $user = User::factory()->create();
    PlatformStaff::factory()->inactive()->for($user)->create();

    $this->actingAs($user)->get(route('portals.admin'))->assertForbidden();
});

test('invited agency members cannot open the agency portal until they join', function () {
    $user = User::factory()->create();
    Membership::factory()->invited()->for($user)->create();

    $this->actingAs($user)->get(route('portals.agency'))->assertForbidden();
});
