<?php

it('shares the correct OG image path as a PNG via Inertia shared props', function () {
    $response = $this->get('/');

    $response->assertInertia(fn ($page) => $page->where('seo.ogImage', fn ($value) => str_ends_with($value, 'og-polsh.png')
    )
    );
});

it('shares the new developer-focused description via Inertia shared props', function () {
    $response = $this->get('/');

    $response->assertInertia(fn ($page) => $page->where('seo.description', fn ($value) => str_contains($value, 'Style your code screenshots')
    )
    );
});
