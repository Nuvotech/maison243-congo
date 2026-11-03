<?php

use Inertia\Testing\AssertableInertia as Assert;

test('home renders the landing page', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('home'));
});

test('search results default to buying', function () {
    $this->get(route('properties.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('properties/index')
            ->where('mode', 'buy'));
});

test('search results can be switched to renting', function () {
    $this->get(route('properties.index', ['mode' => 'rent']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('mode', 'rent'));
});

test('an unknown search mode falls back to buying', function () {
    $this->get(route('properties.index', ['mode' => 'lease']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->where('mode', 'buy'));
});

test('a listing page renders for a listing reference', function () {
    $this->get(route('properties.show', ['reference' => 'M243-117647', 'mode' => 'rent']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('properties/show')
            ->where('reference', 'M243-117647')
            ->where('mode', 'rent'));
});

test('a malformed listing reference is not found', function () {
    $this->get('/properties/not-a-listing')->assertNotFound();
});
