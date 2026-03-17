<?php

namespace App\Jobs;

use App\Services\PolshImageProcessor;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class ProcessPolishJob implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array<string, mixed>  $style
     * @param  array<string, mixed>  $settings
     */
    public function __construct(
        public readonly string $jobId,
        public readonly string $imageUrl,
        public readonly array $style,
        public readonly array $settings,
    ) {}

    public function handle(PolshImageProcessor $processor): void
    {
        try {
            $binary = $processor->process($this->imageUrl, $this->style, $this->settings);

            $format = $this->settings['exportFormat'] ?? 'png';
            $disk = config('services.polsh.export_disk', 'public');
            $path = "polished/{$this->jobId}.{$format}";

            Storage::disk($disk)->put($path, $binary, 'public');

            $url = Storage::disk($disk)->url($path);

            Cache::put("polsh_job_{$this->jobId}", [
                'status' => 'done',
                'url' => $url,
            ], now()->addHour());
        } catch (\Throwable $e) {
            Cache::put("polsh_job_{$this->jobId}", [
                'status' => 'failed',
                'message' => $e->getMessage(),
            ], now()->addHour());

            throw $e;
        }
    }
}
