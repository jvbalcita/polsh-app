<?php

namespace Polsh\LaravelPolsh;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;

class PolshClient
{
    public function __construct(
        private readonly ?string $apiKey,
        private readonly string $baseUrl,
        private readonly string $format,
        private readonly int $resolution,
    ) {}

    /**
     * Style a screenshot and return the CDN URL (or raw binary for sync requests).
     *
     * @param  array<string, mixed>  $options
     */
    public function glaze(string $imageUrl, string $style, array $options = []): string
    {
        $payload = array_merge([
            'image_url' => $imageUrl,
            'style' => $style,
            'format' => $this->format,
            'resolution' => $this->resolution,
        ], $options);

        $response = Http::withToken($this->apiKey)
            ->post("{$this->baseUrl}/api/v1/polish", $payload);

        if ($response->status() === 202) {
            // Async job dispatched — return status_url for polling
            return $response->json('status_url');
        }

        $response->throw();

        // Sync response — store binary and return local path or data URI
        return 'data:image/png;base64,'.base64_encode($response->body());
    }
}
