<?php

use Illuminate\Support\Facades\Route;

it('teams.settings named route resolves to the expected URL', function () {
    expect(Route::has('teams.settings'))->toBeTrue('teams.settings route must exist for the My Team dropdown link');

    $url = route('teams.settings');

    expect($url)->toContain('/teams/settings');
});
