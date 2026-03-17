<?php

namespace Polsh\LaravelPolsh;

use Illuminate\Support\ServiceProvider;

class PolshServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/polsh.php', 'polsh');

        $this->app->singleton(PolshClient::class, function () {
            return new PolshClient(
                apiKey: config('polsh.api_key'),
                baseUrl: config('polsh.base_url'),
                format: config('polsh.format'),
                resolution: config('polsh.resolution'),
            );
        });
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../config/polsh.php' => config_path('polsh.php'),
            ], 'polsh-config');

            $this->commands([
                Console\GlazeCommand::class,
            ]);
        }
    }
}
