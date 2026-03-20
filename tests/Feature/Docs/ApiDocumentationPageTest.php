<?php

use Inertia\Testing\AssertableInertia as Assert;

test('api documentation page is available and renders the inertia component', function () {
    $this->get(route('docs.api'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Docs/Api')
        );
});
