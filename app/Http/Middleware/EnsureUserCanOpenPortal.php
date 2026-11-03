<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserCanOpenPortal
{
    /**
     * Only let the user into the portal that matches their role.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string $portal): Response
    {
        abort_unless($request->user()?->portal() === $portal, Response::HTTP_FORBIDDEN);

        return $next($request);
    }
}
