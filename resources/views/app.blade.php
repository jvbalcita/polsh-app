<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}"  @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'Polsh') }}</title>

        <link rel="icon" href="/images/favicon/favicon.ico" sizes="any">
        <link rel="icon" href="/images/favicon/favicon.svg" type="image/svg+xml">
        <link rel="shortcut icon" href="/images/favicon/favicon.ico" />
        <link rel="icon" type="image/png" href="/images/favicon/favicon-96x96.png" sizes="96x96" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="Polsh" />
        <link rel="manifest" href="/images/favicon/site.webmanifest">

        @vite(['resources/js/app.ts', "resources/js/pages/{$page['component']}.vue"])
        @inertiaHead

        {{-- Analytics --}}
        <script defer data-domain="polsh.work" src="https://plausible.io/js/script.tagged-events.js"></script>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-B4EHL40Q38"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-B4EHL40Q38');
        </script>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
