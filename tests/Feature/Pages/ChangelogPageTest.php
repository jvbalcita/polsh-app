<?php

use Inertia\Testing\AssertableInertia as Assert;

test('changelog page is available and renders the inertia component', function () {
    $this->get(route('changelog'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Changelog')
        );
});
