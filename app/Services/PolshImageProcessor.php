<?php

namespace App\Services;

use GdImage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;
use RuntimeException;

class PolshImageProcessor
{
    public function __construct() {}

    /**
     * Process an image with the given style and settings.
     *
     * @param  array<string, mixed>  $style  Style config from the JSON file
     * @param  array<string, mixed>  $settings  Editor settings (padding, radius, etc.)
     */
    public function process(string $imageUrl, array $style, array $settings): string
    {
        $imageData = @file_get_contents($imageUrl);

        if ($imageData === false) {
            throw new RuntimeException("Failed to fetch image from URL: {$imageUrl}");
        }

        $screenshot = @imagecreatefromstring($imageData);

        if (! $screenshot) {
            throw new RuntimeException('Failed to decode image. Supported formats: PNG, JPEG, WebP, GIF.');
        }

        $resolution = max(1, (int) ($settings['exportResolution'] ?? 1));
        $aspectRatio = $this->parseAspectRatio($settings['aspectRatio'] ?? '16:9');

        // Base canvas: 1920px wide at 1x, scaled by resolution
        $canvasW = 1920 * $resolution;
        $canvasH = (int) round($canvasW / $aspectRatio);

        // Padding overridable from settings; style provides the default
        $padding = (int) round(($settings['padding'] ?? $style['padding'] ?? 48) * $resolution);

        // Scale screenshot to fit available area, never upscaling
        $srcW = imagesx($screenshot);
        $srcH = imagesy($screenshot);
        $availW = $canvasW - $padding * 2;
        $availH = $canvasH - $padding * 2;
        $scale = min($availW / $srcW, $availH / $srcH, 1.0);
        $dstW = (int) round($srcW * $scale);
        $dstH = (int) round($srcH * $scale);

        // Center the card on the canvas
        $cardX = (int) round(($canvasW - $dstW) / 2);
        $cardY = (int) round(($canvasH - $dstH) / 2);

        $radius = (int) round(($settings['radius'] ?? $style['radius'] ?? 12) * $resolution);

        // Create main canvas
        $canvas = imagecreatetruecolor($canvasW, $canvasH);
        imagealphablending($canvas, true);
        imagesavealpha($canvas, true);

        // 1. Background
        $this->drawBackground($canvas, $canvasW, $canvasH, $style['background'] ?? ['type' => 'solid', 'colors' => ['#1a1a1a', '#1a1a1a']]);

        // 2. Shadow (behind the card)
        $shadowConfig = $style['shadow'] ?? null;

        if ($shadowConfig && ($shadowConfig['opacity'] ?? 0) > 0) {
            $this->drawShadow($canvas, $cardX, $cardY, $dstW, $dstH, $radius, $shadowConfig, $resolution);
        }

        // 3. Scale screenshot and apply rounded corners
        $scaled = imagecreatetruecolor($dstW, $dstH);
        imagealphablending($scaled, false);
        imagesavealpha($scaled, true);

        $transparent = imagecolorallocatealpha($scaled, 0, 0, 0, 127);
        imagefill($scaled, 0, 0, $transparent);

        imagecopyresampled($scaled, $screenshot, 0, 0, 0, 0, $dstW, $dstH, $srcW, $srcH);
        imagedestroy($screenshot);

        $this->applyRoundedCorners($scaled, $dstW, $dstH, $radius);

        // 4. Paste screenshot onto canvas
        imagecopy($canvas, $scaled, $cardX, $cardY, 0, 0, $dstW, $dstH);
        imagedestroy($scaled);

        // 5. Border
        $borderConfig = $style['border'] ?? null;
        $borderWidth = (int) round(($settings['borderWidth'] ?? $borderConfig['width'] ?? 1) * $resolution);

        if ($borderWidth > 0 && $borderConfig) {
            $this->drawBorder($canvas, $cardX, $cardY, $dstW, $dstH, $radius, $borderConfig, $borderWidth);
        }

        // 6. Encode and return binary
        $format = $settings['exportFormat'] ?? 'png';

        return $this->encode($canvas, $format);
    }

    /**
     * Load style config from the JSON file.
     *
     * @return array<string, mixed>|null
     */
    public function loadStyle(string $slug): ?array
    {
        $path = resource_path("js/styles/{$slug}.json");

        if (! file_exists($path)) {
            return null;
        }

        return json_decode(file_get_contents($path), true);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private function drawBackground(GdImage $canvas, int $w, int $h, array $bg): void
    {
        $type = $bg['type'] ?? 'solid';
        $colors = $bg['colors'] ?? ['#1a1a1a'];

        if ($type === 'solid' || count($colors) < 2) {
            [$r, $g, $b] = $this->hexToRgb($colors[0]);
            $color = imagecolorallocate($canvas, $r, $g, $b);
            imagefilledrectangle($canvas, 0, 0, $w - 1, $h - 1, $color);

            return;
        }

        // Gradient: row-based top-to-bottom interpolation
        // Approximates diagonal gradients by blending only vertically (fast O(H))
        [$r1, $g1, $b1] = $this->hexToRgb($colors[0]);
        [$r2, $g2, $b2] = $this->hexToRgb($colors[1]);

        for ($y = 0; $y < $h; $y++) {
            $t = $y / $h;
            $r = (int) round($r1 + ($r2 - $r1) * $t);
            $g = (int) round($g1 + ($g2 - $g1) * $t);
            $b = (int) round($b1 + ($b2 - $b1) * $t);
            $color = imagecolorallocate($canvas, $r, $g, $b);
            imagefilledrectangle($canvas, 0, $y, $w - 1, $y, $color);
        }
    }

    /**
     * Draw a layered shadow approximating a Gaussian blur using expanding filled
     * rounded rectangles with linearly increasing alpha toward the center.
     */
    private function drawShadow(
        GdImage $canvas,
        int $x, int $y, int $w, int $h,
        int $radius,
        array $config,
        int $resolution
    ): void {
        $opacity = (float) ($config['opacity'] ?? 0.5);
        $blurPx = (int) round(($config['blur'] ?? 40) * $resolution);
        $offsetY = (int) round(($config['offsetY'] ?? 0) * $resolution);

        [$sr, $sg, $sb] = $this->hexToRgb($config['color'] ?? '#000000');

        // Cap layers to avoid excessive iteration
        $layers = min($blurPx, 40);
        $step = max(1, (int) round($blurPx / $layers));

        for ($i = $blurPx; $i > 0; $i -= $step) {
            // GD alpha: 0=opaque, 127=transparent
            $t = 1.0 - ($i / $blurPx);
            $gdAlpha = (int) round(127 - 127 * $t * $opacity);
            $gdAlpha = max(0, min(127, $gdAlpha));

            $color = imagecolorallocatealpha($canvas, $sr, $sg, $sb, $gdAlpha);
            $r = max(0, $radius + $i);

            $this->drawFilledRoundedRect(
                $canvas,
                $x - $i, $y + $offsetY - $i,
                $x + $w + $i, $y + $offsetY + $h + $i,
                $r,
                $color
            );
        }
    }

    /**
     * Erase screenshot pixels outside the rounded rectangle at each corner.
     * Only processes O(4 × r²) pixels instead of the full image.
     */
    private function applyRoundedCorners(GdImage $img, int $w, int $h, int $radius): void
    {
        if ($radius <= 0) {
            return;
        }

        $r = min($radius, (int) ($w / 2), (int) ($h / 2));
        $transparent = imagecolorallocatealpha($img, 0, 0, 0, 127);
        imagealphablending($img, false);

        // For each corner: iterate the r×r bounding box and erase pixels outside the arc
        $corners = [
            ['arcX' => $r,     'arcY' => $r,     'x0' => 0,     'y0' => 0],
            ['arcX' => $w - $r, 'arcY' => $r,     'x0' => $w - $r, 'y0' => 0],
            ['arcX' => $r,     'arcY' => $h - $r, 'x0' => 0,     'y0' => $h - $r],
            ['arcX' => $w - $r, 'arcY' => $h - $r, 'x0' => $w - $r, 'y0' => $h - $r],
        ];

        foreach ($corners as ['arcX' => $arcX, 'arcY' => $arcY, 'x0' => $x0, 'y0' => $y0]) {
            for ($px = $x0; $px < $x0 + $r; $px++) {
                for ($py = $y0; $py < $y0 + $r; $py++) {
                    if (sqrt(($px - $arcX) ** 2 + ($py - $arcY) ** 2) > $r) {
                        imagesetpixel($img, $px, $py, $transparent);
                    }
                }
            }
        }

        imagealphablending($img, true);
    }

    /**
     * Draw a translucent outline border around the card.
     */
    private function drawBorder(
        GdImage $canvas,
        int $x, int $y, int $w, int $h,
        int $radius,
        array $config,
        int $borderWidth
    ): void {
        $opacity = (float) ($config['opacity'] ?? 0.3);
        $gdAlpha = (int) round(127 - 127 * $opacity);
        $color = imagecolorallocatealpha($canvas, 255, 255, 255, $gdAlpha);

        for ($i = 0; $i < $borderWidth; $i++) {
            $this->drawRoundedRectOutline(
                $canvas,
                $x - $i, $y - $i,
                $x + $w + $i, $y + $h + $i,
                $radius + $i,
                $color
            );
        }
    }

    /**
     * Draw a filled rounded rectangle using GD arcs + axis-aligned rectangles.
     */
    private function drawFilledRoundedRect(GdImage $img, int $x1, int $y1, int $x2, int $y2, int $r, int $color): void
    {
        if ($x1 >= $x2 || $y1 >= $y2) {
            return;
        }

        $r = min($r, (int) (($x2 - $x1) / 2), (int) (($y2 - $y1) / 2));
        $r = max(0, $r);

        imagefilledrectangle($img, $x1 + $r, $y1, $x2 - $r, $y2, $color);
        imagefilledrectangle($img, $x1, $y1 + $r, $x2, $y2 - $r, $color);

        imagefilledarc($img, $x1 + $r, $y1 + $r, $r * 2, $r * 2, 180, 270, $color, IMG_ARC_PIE);
        imagefilledarc($img, $x2 - $r, $y1 + $r, $r * 2, $r * 2, 270, 360, $color, IMG_ARC_PIE);
        imagefilledarc($img, $x1 + $r, $y2 - $r, $r * 2, $r * 2, 90, 180, $color, IMG_ARC_PIE);
        imagefilledarc($img, $x2 - $r, $y2 - $r, $r * 2, $r * 2, 0, 90, $color, IMG_ARC_PIE);
    }

    /**
     * Draw a rounded rectangle outline (no fill).
     */
    private function drawRoundedRectOutline(GdImage $img, int $x1, int $y1, int $x2, int $y2, int $r, int $color): void
    {
        if ($x1 >= $x2 || $y1 >= $y2) {
            return;
        }

        $r = min($r, (int) (($x2 - $x1) / 2), (int) (($y2 - $y1) / 2));
        $r = max(0, $r);

        imageline($img, $x1 + $r, $y1, $x2 - $r, $y1, $color);
        imageline($img, $x1 + $r, $y2, $x2 - $r, $y2, $color);
        imageline($img, $x1, $y1 + $r, $x1, $y2 - $r, $color);
        imageline($img, $x2, $y1 + $r, $x2, $y2 - $r, $color);

        imagearc($img, $x1 + $r, $y1 + $r, $r * 2, $r * 2, 180, 270, $color);
        imagearc($img, $x2 - $r, $y1 + $r, $r * 2, $r * 2, 270, 360, $color);
        imagearc($img, $x1 + $r, $y2 - $r, $r * 2, $r * 2, 90, 180, $color);
        imagearc($img, $x2 - $r, $y2 - $r, $r * 2, $r * 2, 0, 90, $color);
    }

    /**
     * Encode the GD image as the requested format using Intervention Image.
     */
    private function encode(GdImage $canvas, string $format): string
    {
        ob_start();
        imagepng($canvas);
        $pngData = (string) ob_get_clean();
        imagedestroy($canvas);

        $manager = new ImageManager(Driver::class);
        $img = $manager->read($pngData);

        return match ($format) {
            'jpeg' => (string) $img->toJpeg(90),
            'webp' => (string) $img->toWebp(90),
            default => (string) $img->toPng(),
        };
    }

    /**
     * @return array{int, int, int}
     */
    private function hexToRgb(string $hex): array
    {
        $hex = ltrim($hex, '#');

        if (strlen($hex) === 3) {
            $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
        }

        return [
            (int) hexdec(substr($hex, 0, 2)),
            (int) hexdec(substr($hex, 2, 2)),
            (int) hexdec(substr($hex, 4, 2)),
        ];
    }

    private function parseAspectRatio(string $ratio): float
    {
        $parts = explode(':', $ratio);

        return (float) $parts[0] / (float) $parts[1];
    }
}
