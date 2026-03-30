<?php

use Illuminate\Support\Facades\File;

beforeEach(function () {
    $this->sitemapPath = public_path('sitemap.xml');
    $this->originalSitemapExists = File::exists($this->sitemapPath);
    $this->originalSitemapContents = $this->originalSitemapExists
        ? File::get($this->sitemapPath)
        : null;
});

afterEach(function () {
    if ($this->originalSitemapExists) {
        File::put($this->sitemapPath, $this->originalSitemapContents);

        return;
    }

    File::delete($this->sitemapPath);
});

it('returns not found when the sitemap file has not been generated', function () {
    File::delete($this->sitemapPath);

    $this->get('/sitemap.xml')->assertNotFound();
});

it('serves the generated sitemap file when it exists', function () {
    $xml = <<<'XML'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://polsh.work/</loc>
  </url>
</urlset>
XML;

    File::put($this->sitemapPath, $xml);

    $response = $this->get('/sitemap.xml');

    $response
        ->assertSuccessful()
        ->assertHeader('content-type', 'application/xml; charset=UTF-8');

    expect($response->streamedContent())->toContain('https://polsh.work/');
});
