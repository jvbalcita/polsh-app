<?php

use function Pest\Laravel\get;

it('renders the terms of service page', function () {
    get(route('legal.terms'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('legal/Terms'));
});

it('renders the privacy policy page', function () {
    get(route('legal.privacy'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('legal/Privacy'));
});

it('renders the refund policy page', function () {
    get(route('legal.refund'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('legal/Refund'));
});

it('legal pages do not require authentication', function () {
    get(route('legal.terms'))->assertOk();
    get(route('legal.privacy'))->assertOk();
    get(route('legal.refund'))->assertOk();
});
