<?php

test('welcome page no longer shows the github save presets hero cta', function () {
    $welcomePage = file_get_contents(resource_path('js/pages/Welcome.vue'));

    expect($welcomePage)
        ->not->toContain('Save presets with GitHub')
        ->not->toContain('githubRoute.url()');
});
