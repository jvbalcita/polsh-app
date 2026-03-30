<?php

it('schedules sitemap generation daily', function () {
    $this->artisan('schedule:list')
        ->expectsOutputToContain('sitemap:generate')
        ->assertExitCode(0);
});
