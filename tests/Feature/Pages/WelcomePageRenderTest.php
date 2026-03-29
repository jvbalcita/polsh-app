<?php

use Inertia\Testing\AssertableInertia as Assert;

test('home page renders the welcome inertia component with registration availability', function () {
    $this->get('/')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Welcome')
            ->where('canRegister', fn (mixed $value): bool => is_bool($value)));
});
