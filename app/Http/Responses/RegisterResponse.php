<?php

namespace App\Http\Responses;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Laravel\Fortify\Fortify;

class RegisterResponse implements RegisterResponseContract
{
    /**
     * Intercept the post-register redirect:
     * - If the new user is pending admin approval (mentor), log them out and
     *   send them to the dedicated "pending" page instead of the dashboard.
     * - Otherwise, defer to Fortify's default behaviour.
     */
    public function toResponse($request)
    {
        $user = $request->user();

        if ($user instanceof User && $user->isPendingApproval()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($request->wantsJson()) {
                return new JsonResponse(['status' => 'pending_approval'], 201);
            }

            return redirect()->route('auth.pending-approval');
        }

        if ($request->wantsJson()) {
            return new JsonResponse('', 201);
        }

        return redirect()->intended(Fortify::redirects('register'));
    }
}
