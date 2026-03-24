<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    public function terms(): Response
    {
        return Inertia::render('legal/Terms');
    }

    public function privacy(): Response
    {
        return Inertia::render('legal/Privacy');
    }

    public function refund(): Response
    {
        return Inertia::render('legal/Refund');
    }
}
