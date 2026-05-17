<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyEarningController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->hasRole('instructor'), 403);

        return Inertia::render('admin/my-earnings/index');
    }
}
