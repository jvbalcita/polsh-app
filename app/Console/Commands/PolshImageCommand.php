<?php

namespace App\Console\Commands;

use App\Services\PolshImageProcessor;
use Illuminate\Console\Command;

class PolshImageCommand extends Command
{
    protected $signature = 'polsh:image
        {path : Path or URL to the input image}
        {--style=obsidian-glass : Style slug (obsidian-glass, aurora, arctic-white, ...)}
        {--format=png : Output format: png, jpeg, webp}
        {--resolution=1 : Export resolution multiplier: 1, 2, 4}
        {--aspect-ratio=16:9 : Canvas aspect ratio: 16:9, 4:3, 1:1, 3:2, 21:9}
        {--output= : Output file path (defaults to ./polished.{format})}
        {--padding= : Padding in pixels (overrides style default)}
        {--radius= : Corner radius in pixels (overrides style default)}';

    protected $description = 'Apply a Polsh style to a screenshot and save the result';

    public function handle(PolshImageProcessor $processor): int
    {
        $inputPath = $this->argument('path');
        $style = $this->option('style');
        $format = $this->option('format');
        $resolution = (int) $this->option('resolution');

        $styleConfig = $processor->loadStyle($style);

        if (! $styleConfig) {
            $this->error("Style '{$style}' not found. Available: obsidian-glass, neon-halo, arctic-white, terminal-dark, sakura-mesh, aurora, product-hunt, og-minimal, grid-light, dark-studio, browser-light, browser-dark");

            return Command::FAILURE;
        }

        // Resolve input: URL stays as-is, local path is converted to file:// or read directly
        $imageUrl = filter_var($inputPath, FILTER_VALIDATE_URL)
            ? $inputPath
            : 'file://'.realpath($inputPath);

        if (! filter_var($inputPath, FILTER_VALIDATE_URL) && ! file_exists($inputPath)) {
            $this->error("File not found: {$inputPath}");

            return Command::FAILURE;
        }

        $settings = [
            'exportResolution' => $resolution,
            'exportFormat' => $format,
            'aspectRatio' => $this->option('aspect-ratio'),
            'padding' => $this->option('padding') !== null ? (int) $this->option('padding') : null,
            'radius' => $this->option('radius') !== null ? (int) $this->option('radius') : null,
        ];

        $outputPath = $this->option('output') ?: getcwd()."/polished.{$format}";

        $this->info("Processing with style: {$style} ({$resolution}×)…");

        try {
            $binary = $processor->process($imageUrl, $styleConfig, $settings);
        } catch (\RuntimeException $e) {
            $this->error('Processing failed: '.$e->getMessage());

            return Command::FAILURE;
        }

        file_put_contents($outputPath, $binary);

        $this->info("Saved to: {$outputPath}");

        return Command::SUCCESS;
    }
}
