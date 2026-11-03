<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected away from the portals', function (string $url) {
    $this->get($url)->assertRedirect(route('login'));
})->with(['/seller', '/agency', '/admin']);

test('the seller portal opens on properties by default', function () {
    $this->actingAs(User::factory()->seller()->create())
        ->get(route('portals.seller'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('portals/seller')
            ->where('section', 'properties'));
});

test('a portal section can be opened directly', function () {
    $this->actingAs(User::factory()->admin()->create())
        ->get(route('portals.admin', ['section' => 'payments']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('portals/admin')
            ->where('section', 'payments'));
});

test('an unknown portal section is not found', function () {
    $this->actingAs(User::factory()->seller()->create())
        ->get('/seller/not-a-section')
        ->assertNotFound();
});

test('agency principals get the principal view', function () {
    $this->actingAs(User::factory()->agency('Principal')->create())
        ->get(route('portals.agency', ['section' => 'team']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('portals/agency')
            ->where('role', 'principal')
            ->where('section', 'team'));
});

test('agents cannot open principal-only agency sections', function () {
    $this->actingAs(User::factory()->agency('Agent')->create())
        ->get(route('portals.agency', ['section' => 'billing']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('role', 'agent')
            ->where('section', 'listings'));
});

test('agents cannot pose as principals through the query string', function () {
    $this->actingAs(User::factory()->agency('Agent')->create())
        ->get(route('portals.agency', ['section' => 'team', 'role' => 'principal']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('role', 'agent')
            ->where('section', 'listings'));
});

test('principals see the agency profile instead of a personal profile', function () {
    $this->actingAs(User::factory()->agency('Principal')->create())
        ->get(route('portals.agency', ['section' => 'profile']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('section', 'agency'));
});
