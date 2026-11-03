<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Send the user to their portal, or show the generic dashboard when they have none.
     */
    public function __invoke(Request $request): RedirectResponse|Response
    {
        $portal = $request->user()->portal();

        if ($portal !== null) {
            return to_route("portals.{$portal}");
        }

        return Inertia::render('dashboard');
    }
}
