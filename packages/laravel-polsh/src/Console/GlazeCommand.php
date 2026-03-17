<?php

namespace Polsh\LaravelPolsh\Console;

use Illuminate\Console\Command;
use Polsh\LaravelPolsh\PolshClient;

class GlazeCommand extends Command
{
    protected $signature = 'polsh:glaze
        {image : URL or local path of the screenshot}
        {style : Style slug (e.g. obsidian-glass)}
        {--format=png : Output format: png, jpeg, or webp}
        {--resolution=2 : Resolution multiplier: 1, 2, or 4}
        {--output= : Output file path (defaults to ./polished.png)}';

    protected $description = 'Style a screenshot using the Polsh API';

    public function handle(PolshClient $client): int
    {
        $imageUrl = $this->argument('image');
        $style    = $this->argument('style');

        $this->info("Polishing screenshot with style: {$style}");

        $result = $client->glaze($imageUrl, $style, [
            'format'     => $this->option('format'),
            'resolution' => (int) $this->option('resolution'),
        ]);

        $output = $this->option('output') ?? './polished.'.$this->option('format');

        if (str_starts_with($result, 'data:')) {
            $binary = base64_decode(substr($result, strpos($result, ',') + 1));
            file_put_contents($output, $binary);
            $this->info("Saved to: {$output}");
        } else {
            $this->info("Async job started. Poll: {$result}");
        }

        return self::SUCCESS;
    }
}
