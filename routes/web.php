<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PortalController;
use App\Http\Controllers\PropertyController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'home')->name('home');

Route::get('properties', [PropertyController::class, 'index'])->name('properties.index');
Route::get('properties/{reference}', [PropertyController::class, 'show'])
    ->where('reference', 'M243-[0-9]+')
    ->name('properties.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('seller/{section?}', [PortalController::class, 'seller'])
        ->middleware('portal:seller')
        ->whereIn('section', PortalController::SELLER_SECTIONS)
        ->name('portals.seller');
    Route::get('agency/{section?}', [PortalController::class, 'agency'])
        ->middleware('portal:agency')
        ->whereIn('section', PortalController::AGENCY_SECTIONS)
        ->name('portals.agency');
    Route::get('admin/{section?}', [PortalController::class, 'admin'])
        ->middleware('portal:admin')
        ->whereIn('section', PortalController::ADMIN_SECTIONS)
        ->name('portals.admin');
});

require __DIR__.'/settings.php';
