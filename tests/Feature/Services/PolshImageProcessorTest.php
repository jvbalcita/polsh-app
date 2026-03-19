<?php

use App\Services\PolshImageProcessor;
use Illuminate\Support\Facades\Http;

test('image processor rejects failed remote fetches through the http client path', function () {
    Http::preventStrayRequests();
    Http::fake([
        'https://images.test/*' => Http::failedConnection(),
    ]);

    $processor = app(PolshImageProcessor::class);

    expect(fn () => $processor->process('https://images.test/failure.png', [], []))
        ->toThrow(RuntimeException::class, 'Failed to fetch image from URL: https://images.test/failure.png');

    Http::assertSentCount(1);
});

test('image processor rejects private network image urls before making a request', function () {
    Http::preventStrayRequests();

    $processor = app(PolshImageProcessor::class);

    expect(fn () => $processor->process('http://127.0.0.1/internal.png', [], []))
        ->toThrow(RuntimeException::class, 'Private and reserved network image URLs are not allowed.');

    Http::assertNothingSent();
});

test('image processor rejects loopback ipv6 image urls before making a request', function () {
    Http::preventStrayRequests();

    $processor = app(PolshImageProcessor::class);

    expect(fn () => $processor->process('http://[::1]/internal.png', [], []))
        ->toThrow(RuntimeException::class, 'Private and reserved network image URLs are not allowed.');

    Http::assertNothingSent();
});

test('image processor can process a mocked successful remote image fetch without using file_get_contents', function () {
    Http::preventStrayRequests();
    Http::fake([
        'https://images.test/*' => Http::response(testPng(), 200, [
            'Content-Type' => 'image/png',
        ]),
    ]);

    $processor = app(PolshImageProcessor::class);

    $output = $processor->process('https://images.test/success.png', [
        'background' => [
            'type' => 'solid',
            'colors' => ['#111111'],
        ],
    ], [
        'exportFormat' => 'png',
        'exportResolution' => 1,
        'aspectRatio' => '16:9',
    ]);

    expect($output)->not->toBeEmpty();
    expect(substr($output, 0, 8))->toBe("\x89PNG\r\n\x1a\n");

    Http::assertSent(function ($request) {
        return $request->method() === 'GET'
            && $request->url() === 'https://images.test/success.png';
    });
});

function testPng(): string
{
    $image = imagecreatetruecolor(20, 20);
    $color = imagecolorallocate($image, 255, 0, 0);

    imagefill($image, 0, 0, $color);

    ob_start();
    imagepng($image);
    $png = (string) ob_get_clean();
    imagedestroy($image);

    return $png;
}
