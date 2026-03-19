<?php

test('guest sign in button routes to the login page', function () {
    $userMenu = file_get_contents(resource_path('js/components/UserMenu.vue'));

    expect($userMenu)
        ->toContain("import { login } from '@/routes';")
        ->toContain(':href="login()" class="sign-in-btn">Sign in</Link>')
        ->not->toContain(':href="githubRoute()" class="sign-in-btn">Sign in</Link>');
});
