<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class GenerateSitemap extends Command
{
    protected $signature = 'sitemap:generate';

    protected $description = 'Generate the public sitemap.xml file';

    public function handle(): int
    {
        $baseUrl = rtrim(config('app.url'), '/');
        $now = Carbon::now()->toAtomString();

        $urls = [
            ['loc' => $baseUrl.'/', 'changefreq' => 'weekly', 'priority' => '1.0', 'lastmod' => $now],
            ['loc' => $baseUrl.'/changelog', 'changefreq' => 'weekly', 'priority' => '0.6', 'lastmod' => $now],
            ['loc' => $baseUrl.'/docs/api', 'changefreq' => 'monthly', 'priority' => '0.5', 'lastmod' => $now],
            ['loc' => $baseUrl.'/terms-of-service', 'changefreq' => 'monthly', 'priority' => '0.3', 'lastmod' => $now],
            ['loc' => $baseUrl.'/privacy-policy', 'changefreq' => 'monthly', 'priority' => '0.3', 'lastmod' => $now],
            ['loc' => $baseUrl.'/refund-policy', 'changefreq' => 'monthly', 'priority' => '0.3', 'lastmod' => $now],
        ];

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        foreach ($urls as $url) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>{$url['loc']}</loc>\n";
            $xml .= "    <lastmod>{$url['lastmod']}</lastmod>\n";
            $xml .= "    <changefreq>{$url['changefreq']}</changefreq>\n";
            $xml .= "    <priority>{$url['priority']}</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        $path = public_path('sitemap.xml');
        file_put_contents($path, $xml);

        $this->info("Sitemap written to {$path}");

        return self::SUCCESS;
    }
}
