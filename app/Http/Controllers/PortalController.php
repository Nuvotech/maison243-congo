<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PortalController extends Controller
{
    /**
     * Sections available in the private seller portal.
     *
     * @var list<string>
     */
    public const SELLER_SECTIONS = ['properties', 'leads', 'screenings', 'performance', 'profile', 'billing', 'help'];

    /**
     * Sections available in the agency portal.
     *
     * @var list<string>
     */
    public const AGENCY_SECTIONS = ['listings', 'leads', 'screenings', 'performance', 'team', 'agency', 'profile', 'billing', 'help'];

    /**
     * Sections only an agency principal may open.
     *
     * @var list<string>
     */
    public const AGENCY_PRINCIPAL_SECTIONS = ['team', 'agency', 'billing'];

    /**
     * Sections available in the platform admin console.
     *
     * @var list<string>
     */
    public const ADMIN_SECTIONS = ['overview', 'listings', 'sellers', 'agents', 'agencies', 'screenings', 'payments', 'plans'];

    /**
     * Show the private seller portal.
     */
    public function seller(string $section = 'properties'): Response
    {
        return Inertia::render('portals/seller', [
            'section' => $section,
        ]);
    }

    /**
     * Show the agency portal as a principal or as an agent, based on the user's membership.
     */
    public function agency(Request $request, string $section = 'listings'): Response
    {
        $role = $request->user()->activeMembership()?->isAgent() ? 'agent' : 'principal';

        if ($role === 'agent' && in_array($section, self::AGENCY_PRINCIPAL_SECTIONS, true)) {
            $section = 'listings';
        }

        if ($role === 'principal' && $section === 'profile') {
            $section = 'agency';
        }

        return Inertia::render('portals/agency', [
            'section' => $section,
            'role' => $role,
        ]);
    }

    /**
     * Show the platform admin console.
     */
    public function admin(string $section = 'overview'): Response
    {
        return Inertia::render('portals/admin', [
            'section' => $section,
        ]);
    }
}
