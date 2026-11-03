<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    /**
     * Show the property search results.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('properties/index', [
            'mode' => $this->resolveMode($request),
        ]);
    }

    /**
     * Show a single property listing.
     */
    public function show(Request $request, string $reference): Response
    {
        return Inertia::render('properties/show', [
            'mode' => $this->resolveMode($request),
            'reference' => $reference,
        ]);
    }

    /**
     * Resolve whether the visitor is searching to buy or to rent.
     *
     * @return 'buy'|'rent'
     */
    private function resolveMode(Request $request): string
    {
        return $request->query('mode') === 'rent' ? 'rent' : 'buy';
    }
}
