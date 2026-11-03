<?php

use App\Models\User;
use Laravel\Fortify\Features;

beforeEach(function () {
    $this->skipUnlessFortifyHas(Features::registration());
});

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register as private sellers', function () {
    $response = $this->post(route('register.store'), [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $user = User::firstWhere('email', 'test@example.com');
    expect($user->name)->toBe('Test User')
        ->and($user->is_private_seller)->toBeTrue()
        ->and($user->seller_status)->toBe('ID pending')
        ->and($user->public_id)->not->toBeEmpty();
});

test('registration requires a first and last name', function () {
    $this->post(route('register.store'), [
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertSessionHasErrors([
        'first_name' => 'The first name field is required.',
        'last_name' => 'The last name field is required.',
    ]);

    $this->assertGuest();
});
